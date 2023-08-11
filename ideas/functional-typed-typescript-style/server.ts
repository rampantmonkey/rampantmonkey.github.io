import * as Koa from 'koa';
import * as mount from 'koa-mount';

import { init } from './lib';

const hostname = require('os').hostname();

const humanReadable: (n: number) => string = (() => {
  const prefixes: {[key: string]: string} = {
        '24': 'Y',
        '21': 'Z',
        '18': 'E',
        '15': 'P',
        '12': 'T',
        '9': 'G',
        '6': 'M',
        '3': 'K',
        '0': '',
        '-3': 'm',
        '-6': 'µ',
        '-9': 'n',
        '-12': 'p',
        '-15': 'f',
        '-18': 'a',
        '-21': 'z',
        '-24': 'y'
    };

  return (n: number): string => {
    if(!n) { return '0'; }
    let value = Number.parseFloat(n.toPrecision(3));
    let exponent = Math.max(Math.min(
                                    3 * Math.floor(
                                                   Math.floor(Math.log10(Math.abs(value)))/3
                                    ),
                                    24),
                           -24);
    return `${Number.parseFloat((value / Math.pow(10, exponent)).toPrecision(3))}${prefixes[exponent.toString()]}`
  }
})();

const app = new Koa();

const {Pool} = require('pg');
const pool = new Pool({
  user: 'arboriform',
  host: 'localhost',
  password: 'arboriform',
  port: 5432,
  database: 'arboriform',
});

pool.connect()
    .catch((err: Error) => console.error('DB connection error', err.stack));

process.on('SIGINT', () => pool.then(process.exit()));

const lib = init(pool);

const requestCounter = ((value: number = 0) => () => ++value)(0);

app.use(async (ctx, next) => {
  await next();
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
});

app.use(async (ctx, next) => {
  let currentUser = ctx.cookies.get('current_user');
  if(ctx.url === '/ui/documentation.html' && !currentUser) {
    ctx.redirect('/ui');
    return;
  }
  await next();
})

app.use(async (ctx, next) => {
  const requestId = requestCounter();
  ctx.state.requestId = requestId;
  const start = Date.now();
  ctx.state.start = start;

  console.log(`--> ${start} ${hostname} ${process.pid} ${requestId} ${ctx.method} ${ctx.url}`);

  await next()

  const ms = Date.now() - start
  const rt = `${ms}ms`
  ctx.set('X-Response-Time', rt)
  const size = humanReadable(ctx.response.length)
  console.log(`<-- ${start} ${hostname} ${process.pid} ${requestId} ${ctx.method} ${ctx.url} ${rt} ${size}B`)
});

app.use(async (ctx, next) => {
  if(ctx.url === '*' && ctx.method === 'OPTIONS') {
    ctx.set('Content-Type', 'application/json')
    ctx.body = apiOptions;
  }
  await next()
})

app.use(async (ctx, next) => {
  if(ctx.method === 'GET' && ctx.url === '/') {
    ctx.redirect('/ui');
    return;
  }

  await next();
});

import { init as ui } from './ui';
app.use(mount('/ui', ui(lib)));

import { init as api } from './api';
const [ apiApp, apiOptions ] = api(lib);
app.use(mount('/api', apiApp));


const port = 4444;
app.listen(port, undefined, undefined, () => console.log(`Listening on port ${port}`));
