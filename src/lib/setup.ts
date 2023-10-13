// Unless explicitly defined, set NODE_ENV as development:
import '@sapphire/plugin-logger/register'
import '@sapphire/plugin-editable-commands'
import { setup } from '@skyra/env-utilities'
import * as colorette from 'colorette'
import { join } from 'node:path'
import { srcDir } from './constants'

process.env.NODE_ENV ??= 'development'

// Read env var
setup({ path: join(srcDir, '..', '.env') })

// Enable colorette
colorette.createColors({ useColor: true })
