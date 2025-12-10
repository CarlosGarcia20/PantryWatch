% ======================================================
%  CEREBRO DE PANTRYWATCH (FINAL INTEGRADO v2.0)
% ======================================================
:- use_module(library(odbc)).

% 1. DECLARACIÓN DE DINÁMICOS (Memoria RAM)
:- dynamic producto/4.        % ID, Nombre, PesoUnit, _
:- dynamic stock_minimo/2.    % ID, StockMin
:- dynamic condicion_ideal/3. % ID, TempMax, HumMax
:- dynamic estante_actual/3.  % Estante, ID, PesoActual
:- dynamic ambiente_actual/3. % Zona, Temp, Humedad
:- dynamic zona_estante/2.    % Estante, Zona

% Configuraciones Físicas (Hechos estáticos)
capacidad_maxima_estante(e1, 5000). % El estante 1 aguanta 5kg (5000g)

% ------------------------------------------------------
% 2. CONEXIÓN Y CARGA (ETL)
% ------------------------------------------------------

iniciar_sistema :-
    write('🔌 Prolog: Intentando conectar ODBC...'), nl,
    % Conectamos a Postgres
    catch(
        odbc_connect('PantryDB', _Connection, [alias(pantry_conn), open(once)]),
        error(existence_error(_, _), _), % Ignorar si ya está conectado
        (write('⚠️ Ya estaba conectado o driver ocupado.'), nl)
    ),
    sincronizar_datos.

sincronizar_datos :-
   write('📥 Descargando datos de la Base de datos...'), nl,
    
    % Limpieza
    retractall(producto(_,_,_,_)),
    retractall(stock_minimo(_,_)),
    retractall(condicion_ideal(_,_,_)),
    retractall(estante_actual(_,_,_)),
    retractall(zona_estante(_,_)), % Limpiamos zonas también

    % Configuración inicial de zonas (Asumimos e1 = cocina por defecto)
    assertz(zona_estante(e1, cocina)),

    % Query SQL
    odbc_query(pantry_conn,
        'SELECT 
            id_producto, 
            nombre, 
            peso_unitario, 
            stock_minimo, 
            peso_actual, 
            temp_max, 
            humedad_max 
        FROM productos', 
        row(ID, Nombre, PesoUnit, StockMin, PesoActual, TMax, HMax)
    ),
    
    % Guardar en RAM
    assertz(producto(ID, Nombre, PesoUnit, 0)), 
    assertz(stock_minimo(ID, StockMin)),
    assertz(estante_actual(e1, ID, PesoActual)), 
    assertz(condicion_ideal(ID, TMax, HMax)),
    
    fail. % Backtracking forzado

sincronizar_datos :- 
    write('✅ Datos sincronizados.'), nl.

cerrar_conexion :- 
    catch(odbc_disconnect(pantry_conn), _, true),
    write('🔌 Desconectado.').

% ------------------------------------------------------
% 3. INTERFAZ DE SENSORES
% ------------------------------------------------------

% Llamado por Node.js: actualizar_sensor(cocina, 32, 60).
actualizar_sensor(Zona, NuevaTemp, NuevaHum) :-
    retractall(ambiente_actual(Zona, _, _)),
    assertz(ambiente_actual(Zona, NuevaTemp, NuevaHum)),
    format('📡 Sensor ~w actualizado: T=~w H=~w~n', [Zona, NuevaTemp, NuevaHum]).

% Helper para detectar peligros (usado por Node)
detectar_peligro_calor(Nombre, TempActual) :-
    riesgo_ambiental_temp(ID), 
    producto(ID, Nombre, _, _),
    estante_actual(Estante, ID, _),
    zona_estante(Estante, Zona),
    ambiente_actual(Zona, TempActual, _).

% ------------------------------------------------------
% 4. REGLAS BÁSICAS (Lógica Original)
% ------------------------------------------------------

% ======================================================
%  REGLAS
% ======================================================

% 1. Calcular cuántas unidades quedan (Matemática básica)
unidades_restantes(ProductoID, Unidades) :-
    estante_actual(_, ProductoID, PesoActual),
    producto(ProductoID, _, PesoUnitario, _),
    PesoUnitario > 0, !,
    Unidades is floor(PesoActual / PesoUnitario).

% 2. Detectar necesidad de reponer (Stock bajo por peso)
necesita_reponer(ProductoID) :-
    estante_actual(_, ProductoID, PesoActual),
    stock_minimo(ProductoID, PesoMinimo),
    PesoActual =< PesoMinimo.

% 3. Detectar producto agotado/desaparecido (Está en catálogo pero no en estante)
necesita_reponer(ProductoID) :-
    stock_minimo(ProductoID, _),
    \+ estante_actual(_, ProductoID, _).

% 4. Riesgo por Temperatura (Sensor vs Ideal)
riesgo_temperatura(ProductoID) :-
    estante_actual(E, ProductoID, _),
    zona_estante(E, Zona),
    ambiente_actual(Zona, TActual, _),
    condicion_ideal(ProductoID, TMax, _),
    TActual > TMax.

% 5. Riesgo por Humedad (Sensor vs Ideal)
riesgo_humedad(ProductoID) :-
    estante_actual(E, ProductoID, _),
    zona_estante(E, Zona),
    ambiente_actual(Zona, _, HActual),
    condicion_ideal(ProductoID, _, HMax),
    HActual > HMax.

% 6. Alerta Ambiental General (Operador Lógico OR)
alerta_ambiental(ProductoID) :-
    riesgo_temperatura(ProductoID) ;
    riesgo_humedad(ProductoID).

% 7. Estado de Conservación (Diagnóstico avanzado)
estado_conservacion(Nombre, 'CRITICO') :-
    producto(ID, Nombre, _, _),
    alerta_ambiental(ID).

% 8. Estado de Conservación (Caso favorable)
estado_conservacion(Nombre, 'OPTIMO') :-
    producto(ID, Nombre, _, _),
    \+ alerta_ambiental(ID).

% 9. Localizador de Productos (Búsqueda)
donde_esta_producto(Nombre, Zona) :-
    producto(ID, Nombre, _, _),
    estante_actual(E, ID, _),
    zona_estante(E, Zona).

% 10. Generador de Alertas para API (Interfaz con Node.js)
generar_alerta(Nombre, 'REVISAR URGENTE') :-
    producto(ID, Nombre, _, _),
    (necesita_reponer(ID) ; alerta_ambiental(ID)).