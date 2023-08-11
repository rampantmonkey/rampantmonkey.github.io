import * as Koa from 'koa';
import { Context, DefaultState } from 'koa';
import * as Router from '@koa/router';
import * as getRawBody from 'raw-body';
import { isInternal, isValidation, Library } from '../lib';
import { toId, thenOk, expect, unwrap } from '../../prelude';

export const init = (library: Library): [Koa, string] => {

  const app = new Koa();

  const router = new Router<DefaultState, Context>();
  app.use(async (ctx, next) => {
    try {
      await next()
      const status = ctx.status || 404;

    } catch (err) {
      if(isValidation(err)) {
        ctx.status = 400;
        ctx.body = err.message;
        return;
      }
      ctx.status = err.status || 500;
      ctx.body = isInternal(err) ? err.payload : err.message;
    };
  });

  app.use(async (ctx, next) => {
    // NOTE: This is where we will add actual authentication.
    ctx.state.currentUserId = null;
    ctx.state.currentUser = null;
    const currentUser = ctx.cookies.get('current_user');
    if(currentUser) {
      expect(thenOk(await library.getUser(toId(currentUser))
                  , (user): void => {
                      ctx.state.currentUserId = user.id;
                      ctx.state.currentUser = user;
                  }));
    } else {
      ctx.throw(401);
    }
    await next();
  })

  app.use(async (ctx, next) => {
    if(ctx.method === 'PUT') {
      ctx.request.method = 'GET'
    }
    await next();
  })

  router.post('CreateTemplate', '/template.create', async (ctx, next) => {
    let body = await getRawBody(ctx.req, {
      length: ctx.req.headers['content-length'],
      limit: '1kb',
      encoding: 'utf-8',
    });
    ctx.body = unwrap(await library.createTemplate(body, ctx.state.currentUserId));
    await next();
  });

  router.get('GetTemplate', '/template.get', async (ctx, next) => {
    const body = await getRawBody(ctx.req, {
      length: ctx.req.headers['content-length'],
      limit: '1kb',
      encoding: 'utf-8',
    });
    ctx.body = unwrap(await library.getTemplate(body, ctx.state.currentUserId));
  });

  router.post('ReplaceTemplate', '/template.replace', async (ctx, next) => {
    try {
      const templateId = ctx.query.id as string;
      const body = await getRawBody(ctx.req, {
        length: ctx.req.headers['content-length'],
        limit: '1kb',
        encoding: 'utf-8',
      });
      ctx.body = unwrap(await library.replaceTemplate(body, ctx.state.currentUserId));
    } catch (error) {
      ctx.throw(error)
    }
  });

  router.post('TaskSubmission', '/task.submission', async (ctx, next) => {
    const body = await getRawBody(ctx.req, {
      length: ctx.req.headers['content-length'],
      limit: '1kb',
      encoding: 'utf-8',
    });
    ctx.body = unwrap(await library.taskSubmission(body, ctx.state.currentUserId));
  });

  router.post('InstantiateTemplate', '/template.instantiate', async (ctx, next) => {
    const body = await getRawBody(ctx.req, {
      length: ctx.req.headers['content-length'],
      limit: '1kb',
      encoding: 'utf-8',
    });
    ctx.body = unwrap(await library.instantiateTemplate(body, ctx.state.currentUserId));
  });

  router.get('GetTemplateByUser', '/template.getByUser', async (ctx, next) => {
    ctx.body = unwrap(await library.getTemplatesByUser(ctx.state.currentUserId));
  });

  router.get('GetAssignedTasks', '/task.getAssignedTasks', async (ctx, next) => {
    ctx.body = unwrap(await library.getAssignedTasks(ctx.state.currentUserId));
  });

  router.get('GetTask', '/task.get', async (ctx, next) => {
    const body = await getRawBody(ctx.req, {
      length: ctx.req.headers['content-length'],
      limit: '1kb',
      encoding: 'utf-8',
    });
    ctx.body = unwrap(await library.getTask(body, ctx.state.currentUserId));
  });

  router.get('GetAssessmentReport', '/assessment.getReport', async (ctx, next) => {
    const body = await getRawBody(ctx.req, {
      length: ctx.req.headers['content-length'],
      limit: '1kb',
      encoding: 'utf-8',
    });
    ctx.body = unwrap(await library.getAssessmentReport(body, ctx.state.currentUserId));
  });

  router.get('ListAssessments', '/assessment.listAssessments', async (ctx, next) => {
    ctx.body = unwrap(await library.listAssessments(ctx.state.currentUserId));
   });

  app.use(router.routes())
    .use(router.allowedMethods());

  let optionsResponse = (() => {
    return JSON.stringify(router.stack.map((stack) => {
      return {
        path: stack.path,
        name: stack.name,
        methods: stack.methods
      };
    }));
  })();

  return [ app, optionsResponse ];
};