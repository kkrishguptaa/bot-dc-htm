import { join } from 'path'

export const rootDir = join(__dirname, '..', '..')
export const srcDir = join(rootDir, 'src')
export const isDev = process.env.NODE_ENV !== 'production'
