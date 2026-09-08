import { Hono } from 'hono';
import type { Bindings } from '../../config/env.js';
import { rotasAuth } from './auth.rotas.js';
import { rotasPaciente } from './paciente.rotas.js';
import { rotasAtendimento } from './atendimento.rotas.js';
import { rotasEscola } from './escola.rotas.js';
import { rotasRbac } from './rbac.rotas.js';
import { rotasUsuarios } from './usuarios.rotas.js';

export const rotasV1 = new Hono<{ Bindings: Bindings }>();

rotasV1.route('/auth', rotasAuth);
rotasV1.route('/pacientes', rotasPaciente);
rotasV1.route('/atendimentos', rotasAtendimento);
rotasV1.route('/escolas', rotasEscola);
rotasV1.route('/rbac', rotasRbac);
rotasV1.route('/usuarios', rotasUsuarios);
