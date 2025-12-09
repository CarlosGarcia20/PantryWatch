import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.join(path.dirname(__filename), '../../'); 

export const PROLOG_FILE_PATH = path.join(ROOT_DIR, 'prolog', 'cerebro.pl');