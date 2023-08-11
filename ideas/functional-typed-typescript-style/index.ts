import { strict as assert } from 'assert';
import { readdirSync, readFileSync } from 'fs';
import { join as joinPaths } from 'path';
import * as querystring from 'querystring';
import { Id, Ok, Err, Result, isOk, awaitThenOk, thenOk, isErr } from '../../prelude';
import {Pool, QueryResult} from 'pg';
import { Compilation, compile, renderTasks, Tree } from './template';

type NotExists = { _tag: 'NotExists'; };
export const NotExists = (): Error => <NotExists>{_tag: 'NotExists'};
type Unauthorized = { _tag: 'Unauthorized'; };
export const Unauthorized = (): Error => <Unauthorized>{_tag: 'Unauthorized'};
type Internal = { _tag: 'Internal', payload: any };
export const Internal = (payload: any): Error => <Internal>{_tag: 'Internal', payload};
type Validation = { _tag: 'Validation', message: any };
export const Validation = (message: any): Error => <Validation>{_tag: 'Validation', message};
type UnknownEncodingFormat = { _tag: 'UnknownEncodingFormat', message: any };
export const UnknownEncodingFormat = (message: any): Error => <UnknownEncodingFormat>{_tag: 'UnknownEncodingFormat', message};
export type Error = NotExists | Unauthorized | Internal | Validation | UnknownEncodingFormat | Compilation;
export const isCompilation = (e: Error): e is Compilation => e._tag === 'Compilation';
export const isNotExists = (e: Error): e is NotExists => e._tag === 'NotExists';
export const isUnauthorized = (e: Error): e is Unauthorized => e._tag === 'Unauthorized';
export const isInternal = (e: Error): e is Internal => e._tag === 'Internal';
export const isValidation = (e: Error): e is Validation => e._tag === 'Validation';
export type LibResult<T> = Result<T, Error>;

enum Permission {
    GRANT_ACCOUNT_PERMISSION = 'grant_account_permission',
    REVOKE_ACCOUNT_PERMISSION = 'revoke_account_permission',
    GET_ACCOUNT = 'get_account',
    GRANT_TENANT_PERMISSION = 'grant_tenant_permission',
    REVOKE_TENANT_PERMISSION = 'revoke_tenant_permission',
    CREATE_ACCOUNT = 'create_account',
    CREATE_COLONY = 'create_colony',
    CREATE_COLONY_RELATION = 'create_colony_relation',
    CREATE_NEW_TEMPLATE = 'create_new_template',
    INSTANTIATE_TEMPLATE = 'instantiate_template',
    GRANT_TEMPLATE_PERMISSION = 'grant_template_permission',
    REVOKE_TEMPLATE_PERMISSION = 'revoke_template_permission',
    GET_TEMPLATE = 'get_template',
    REPLACE_TEMPLATE = 'replace_template',
    GRANT_TASK_PERMISSION = 'grant_task_permission',
    REVOKE_TASK_PERMISSION = 'revoke_task_permission',
    SUBMIT_SUBMISSION = 'submit_submission',
    GET_TASK = 'get_task',
    GRANT_ASSESSMENT_PERMISSION = 'grant_assessment_permission',
    REVOKE_ASSESSMENT_PERMISSION = 'revoke_assessment_permission',
    GET_ASSESSMENT = 'get_assessment',
}

enum ChangeType {
  CREATE_TEMPLATE = 'create_template',
  INSTANTIATE_TEMPLATE = 'instantiate_template',
  REPLACE_TEMPLATE = 'replace_template',
  CREATE_TASK = 'create_task',
  SUBMIT_SUBMISSION_TASK = 'submit_submission_task',
}

type ColonyId = Id;
type UserId = Id;
type User = {
  id: UserId,
  tenant: number,
  display_name: string,
  created_at: Date,
};

type TemplateId = Id;
type Template = {
  id: TemplateId,
  name: string,
  content: string,
};

type AssessmentId = Id;
type TaskId = Id;

type Task = {
  task: TaskId, // TODO: Change this to Id in the database response
  prompt: string,
};

type AssignedTasks = {
  assessment: AssessmentId,
  tasks: Array<Task>,
};

type CreateTemplateRequest = {
  name: string,
  content: string,
}

type ReplaceTemplateRequest = {
  content: string,
  id: TemplateId,
}

type TaskSubmissionRequest = {
  submission: string,
  id: TaskId,
}

type GetTaskRequest = {
  id: TaskId,
}

type GetAssessmentReportRequest = {
  id: AssessmentId,
}

type GetTemplateRequest = {
  id: TemplateId,
}

type InstantiateTemplateRequest = {
  id: TemplateId,
}

type WebhookSubscriptionRequest = {
  changeType: ChangeType,
  webhookUrl: string,
}

const isNumber = (value: any): value is number => {
  return Number.isInteger(value);
}

const isId = (value: any): value is Id => {
  return isNumber(value);
}

const isTemplateId = (value: any): value is TemplateId => {
  return isId(value);
}

const isTaskId = (value: any): value is TaskId => {
  return isId(value);
}

const isAssessmentId = (value: any): value is AssessmentId => {
  return isId(value);
}

const parse = (str: string): any => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return querystring.parse(str);
  }
}

export const findTask = (ats: Array<AssignedTasks>, id: TaskId): Task | null => {
  for(let i=0; i < ats.length; ++i) {
    for(let j=0; j < ats[i].tasks.length; ++j) {
      if(ats[i].tasks[j].task === id) {
        return ats[i].tasks[j];
      }
    }
  }

  return null
}

const CreateTemplateRequest = (requestBody: string): LibResult<CreateTemplateRequest> => {
  try {
    let body = parse(requestBody);
    if (!body) return Err(UnknownEncodingFormat('Unknown request body format'));
    let errorMessages = [];
    if(!body.name) errorMessages.push('name');
    if(!body.content) errorMessages.push('content');
    if(errorMessages.length) {
      const message = `The following fields are required: ${errorMessages.join()}`
      return Err(Validation(message));
    }
    if(Array.isArray(body.name)) {
      body.name = body.name.join('');
    }
    if(Array.isArray(body.content)) {
      body.content = body.content.join('');
    }
    return Ok({
      name: body.name,
      content: body.content
    });
  } catch (error) {
    return Err(Validation(error));
  }

}

const TaskSubmissionRequest = (requestBody: string): LibResult<TaskSubmissionRequest> => {
  try {
    let body = parse(requestBody);
    if(!body) return Err(UnknownEncodingFormat('Unknown request body format'));
    let errorMessages = [];
    if(!body.id) errorMessages.push('id');
    if(!body.submission) errorMessages.push('submission');
    if(errorMessages.length) {
      const message = `The following fields are required: ${errorMessages.join()}`
      return Err(Validation(message));
    }
    if(Array.isArray(body.submission)) {
      body.submission = body.submission.join('');
    }
    return Ok(body);
  } catch (error) {
    return Err(Validation(error));
  }

}

const ReplaceTemplateRequest = (requestBody: string): LibResult<ReplaceTemplateRequest> => {
  try {
    let body = parse(requestBody);

    if(!body) return Err(UnknownEncodingFormat('Unknown request body format'));
    let errorMessages = [];
    if(!body.id) errorMessages.push('id');
    if(!body.content) errorMessages.push('content');
    if(errorMessages.length) {
      const message = `The following fields are required: ${errorMessages.join()}`
      return Err(Validation(message));
    }
    if(Array.isArray(body.content)) {
      body.content = body.content.join('');
    }
    return Ok(body);
  } catch (error) {
    return Err(Validation(error));
  }
}

const GetTemplateRequest = (request: string | TemplateId): LibResult<GetTemplateRequest> => {
  try {
    let body;
    let errorMessages = [];
    if(isTemplateId(request)){
      return Ok({ id: request });
    }
    if(typeof request === 'string') {
      body = parse(request);
    }
    if(!body) return Err(UnknownEncodingFormat('Unknown request body format'));
    if(!body.id) errorMessages.push('id');
    if(errorMessages.length) {
      const message = `The following fields are required: ${errorMessages.join()}`
      return Err(Validation(message));
    }
    if(Array.isArray(body.id)) {
      body.id = body.id.join('');
    }
    return Ok({ id: body.id });
  } catch (error) {
    return Err(Validation(error));
  }
}

const GetTaskRequest = (request: string | TaskId): LibResult<GetTaskRequest> => {
  try {
    let body;
    let errorMessages = [];
    if(isTaskId(request)){
      return Ok({id: request});
    }
    if(typeof request === 'string') {
      body = parse(request);
    }
    if(!body) return Err(UnknownEncodingFormat('Unknown request body format'));
    if(!body.id) errorMessages.push('id');
    if(errorMessages.length) {
      const message = `The following fields are required: ${errorMessages.join()}`
      return Err(Validation(message));
    }
    if(Array.isArray(body.id)) {
      body.id = body.id.join('');
    }
    return Ok({ id: body.id });
  } catch (error) {
    return Err(Validation(error));
  }
}

const GetAssessmentReportRequest = (request: string | TaskId): LibResult<GetAssessmentReportRequest> => {
  try {
    let body;
    let errorMessages = [];
    if(isAssessmentId(request)){
      return Ok({ id: request });
    }
    if(typeof request === 'string') {
      body = parse(request);
    }
    if(!body) return Err(UnknownEncodingFormat('Unknown request body format'));
    if(!body.id) errorMessages.push('id');
    if(errorMessages.length) {
      const message = `The following fields are required: ${errorMessages.join()}`
      return Err(Validation(message));
    }
    if(Array.isArray(body.id)) {
      body.id = body.id.join('');
    }
    return Ok({ id: body.id });
  } catch (error) {
    return Err(Validation(error));
  }
}

const InstantiateTemplateRequest = (request: string | TemplateId): LibResult<InstantiateTemplateRequest> => {
  try {
    let body;
    let errorMessages = [];
    if(isTemplateId(request)){
      return Ok({ id: request });
    }
    if(typeof request === 'string') {
      body = parse(request);
    }
    if(!body) return Err(UnknownEncodingFormat('Unknown request body format'));
    if(!body.id) errorMessages.push('id');
    if(errorMessages.length) {
      const message = `The following fields are required: ${errorMessages.join()}`
      return Err(Validation(message));
    }
    if(Array.isArray(body.id)) {
      body.id = body.id[0];
    }
    return Ok({ id: body.id });
  } catch (error) {
    return Err(Validation(error));
  }
}

const WebhookSubscriptionRequest = (requestBody: string): LibResult<WebhookSubscriptionRequest> => {
  try {
    let body = parse(requestBody);
    let errorMessages = [];
    if(!body) return Err(UnknownEncodingFormat('Unknown request body format'));
    if(!body.changeType) errorMessages.push('changeType');
    if(!body.webhookUrl) errorMessages.push('webhookUrl');
    if(errorMessages.length) {
      const message = `The following fields are required: ${errorMessages.join()}`
      return Err(Validation(message));
    }
    return Ok({ changeType: body.changeType, webhookUrl: body.webhookUrl });
  } catch (error) {
    return Err(Validation(error));
  }
}

// TODO: Namespace queries by tenant
export type Db = {
  listAllUsers: () => Promise<LibResult<Array<User>>>,
  getUser: (id: UserId) => Promise<LibResult<User>>,
  isUser: (id: UserId) => Promise<LibResult<boolean>>,
  templatesByUser: (id: UserId) => Promise<LibResult<Array<Template>>>,
  createTemplate: (onBehalfOf: UserId, name: string, content: string) => Promise<LibResult<TemplateId>>,
  getTemplate: (onBehalfOf: UserId, id: TemplateId) => Promise<LibResult<Template>>,
  replaceTemplate: (onBehalfOf: UserId, id: TemplateId, content: string) => Promise<LibResult<TemplateId>>,
  instantiateTemplate: (onBehalfOf: UserId, id: TemplateId, content: any) => Promise<LibResult<AssessmentId>>,
  getAssignedTasks: (id: UserId) => Promise<LibResult<Array<AssignedTasks>>>,
  getTask: (id: TaskId, user: UserId) => Promise<LibResult<Task>>,
  submitSubmission: (uid: UserId, tid: TaskId, submission: string) => Promise<LibResult<any>>,
  listAssessments: (id: UserId) => Promise<LibResult<Array<AssessmentId>>>,
  getAssessmentReport: (uid: UserId, id: AssessmentId) => Promise<LibResult<any>>,
  grantPermission: (onBehalfOf: UserId, id: Id, colony: ColonyId, permission: Permission) => Promise<LibResult<any>>,
  revokePermission: (onBehalfOf: UserId, id: Id, colony: ColonyId, permission: Permission) => Promise<LibResult<any>>,
};

export type Library = {
  listAllUsers: () => Promise<LibResult<Array<User>>>,
  getUser: (userId: UserId) => Promise<LibResult<User>>,
  isUser: (userId: UserId) => Promise<LibResult<boolean>>,
  createTemplate: (request: string, userId: UserId) => Promise<LibResult<TemplateId>>,
  replaceTemplate: (request: string, userId: UserId) => Promise<LibResult<TemplateId>>,
  instantiateTemplate: (request: string, userId: UserId) => Promise<LibResult<AssessmentId>>,
  taskSubmission: (submission: string,  userId: UserId) => Promise<LibResult<any>>,
  getTemplate: (request: string | TemplateId, userId: UserId) => Promise<LibResult<Template>>,
  getTemplatesByUser: (userId: UserId) => Promise<LibResult<Array<Template>>>,
  getTask: (request: string | TaskId, userId: UserId) => Promise<LibResult<Task>>,
  getAssignedTasks: (userId: UserId) => Promise<LibResult<Array<AssignedTasks>>>,
  listAssessments: (userId: UserId) => Promise<LibResult<Array<AssessmentId>>>,
  getAssessmentReport: (request: string | AssessmentId, userId: UserId) => Promise<LibResult<any>>,
  grantPermission: (onBehalfOf: UserId, id: Id, colony: ColonyId, permission: Permission) => Promise<LibResult<any>>,
  revokePermission: (onBehalfOf: UserId, id: Id, colony: ColonyId, permission: Permission) => Promise<LibResult<any>>,
  db: Db
};

const extractRows = <T>(result: QueryResult<T>): Array<T> => result.rows;
const headOrError = <T>(rows: Array<T>): T => {
  const numRows = rows.length;
  if (numRows === 1) { return rows[0]; }
  throw new Error(`${numRows} results instead of exactly 1`);
};

const oneRowImpactedByStatementOrError = <T>(result: QueryResult<T>): boolean => {
  if (result.rowCount !== 1) { throw new Error(`${result.rowCount} rows impacted instead of exactly 1`); }
  return true;
}

const keyOrError = <T>(obj: {[key: string]: T}, key: string): T => {
  return obj[key]
};

const wrapOk = <T>(t: T): LibResult<T> => Ok(t);
const buildError = <_>(e: any): LibResult<_> => {
  // TODO: Parse e into more specific errors when possible.
  return Err(Internal(e));
};

const nonEmpty = <T>(result: QueryResult<T>): boolean => result.rowCount !== 0;

export const init = (pool: Pool): Library => {
  let db = initDb(pool);
  return<Library>{
    createTemplate: (request: string, userId: UserId) => awaitThenOk(CreateTemplateRequest(request), (template: CreateTemplateRequest) => db.createTemplate(userId, template.name, template.content)),
    replaceTemplate: (request: string, userId: UserId) => awaitThenOk(ReplaceTemplateRequest(request), (template: ReplaceTemplateRequest) => db.replaceTemplate(userId, template.id, template.content)),
    instantiateTemplate: (request: string, userId: UserId) =>
      awaitThenOk(InstantiateTemplateRequest(request),
        async (template: InstantiateTemplateRequest) =>
          awaitThenOk(await db.getTemplate(userId, template.id),
            (template: Template) =>
              awaitThenOk(compile(template.content),
                (compiled: Tree) =>
                  db.instantiateTemplate(userId, template.id, renderTasks(compiled))
              )
          )
      ),
    taskSubmission: (request: string, userId: UserId) => awaitThenOk(TaskSubmissionRequest(request), (task: TaskSubmissionRequest) => db.submitSubmission(userId, task.id, task.submission)),
    getTemplate: (request: string | TemplateId, userId: UserId) => awaitThenOk(GetTemplateRequest(request), (template: GetTemplateRequest) => db.getTemplate(userId, template.id)),
    getTemplatesByUser: (userId: UserId) => db.templatesByUser(userId),
    getTask: (request: string | TaskId, userId: UserId) => awaitThenOk(GetTaskRequest(request), (task: GetTaskRequest) => db.getTask(task.id, userId)),
    getAssignedTasks: (userId: UserId) => db.getAssignedTasks(userId),
    listAssessments: (userId: UserId) => db.listAssessments(userId),
    getAssessmentReport: (request: string | AssessmentId, userId: UserId) => awaitThenOk(GetAssessmentReportRequest(request), (assessment: GetAssessmentReportRequest) => db.getAssessmentReport(userId, assessment.id)),
    getUser: (userId: UserId) => db.getUser(userId),
    isUser: (userId: UserId) => db.isUser(userId),
    listAllUsers: () => db.listAllUsers(),
    grantPermission: (onBehalfOf: UserId, id: Id, colony: ColonyId, permission: Permission) => db.grantPermission(onBehalfOf, id, colony, permission),
    revokePermission: (onBehalfOf: UserId, id: Id, colony: ColonyId, permission: Permission) => db.revokePermission(onBehalfOf, id, colony, permission),
  }
}

type DbQueries = {
  getAccounts: string,
  getAccount: string,
  getTemplates: string,
  getTemplate: string,
  insertEvent: string,
  getAssignedTasks: string,
  getTask: string,
  getAssessments: string,
  getAssessmentReport: string,
};
const queries = ((queriesDir: string): DbQueries => {
  type ExtractQueryResult = {
    name: string,
    query: string,
  }
  const extractedQueries =  readdirSync(queriesDir).map<ExtractQueryResult>(p => {
    const absolutePath = joinPaths(queriesDir, p);
    const content = readFileSync(absolutePath, 'utf8')
      .replace(/--.+(\r\n|\r|\n)/g, '') // remove comments
      .replace(/\s+/g, ' ').trim(); // remove extra whitespace

    const regex = /(?<!:):'*\w+(?=\b)'*/g;
    const query = [...content.matchAll(regex)].reduce((acc, key, i) => {
      return acc.replace(key[0], `$${i + 1}`);
    }, content);
    return {
      name: p.split('.')[0],
      query,
    }
  });
  const listAllUsers = extractedQueries.find(q => q.name === 'get_accounts');
  assert(listAllUsers);
  const getAccount = extractedQueries.find(q => q.name === 'get_account');
  assert(getAccount);
  const getTemplates = extractedQueries.find(q => q.name === 'get_templates');
  assert(getTemplates);
  const getTemplate = extractedQueries.find(q => q.name === 'get_template');
  assert(getTemplate);
  const insertEvent = extractedQueries.find(q => q.name === 'insert_event');
  assert(insertEvent);
  const getAssignedTasks = extractedQueries.find(q => q.name === 'get_assigned_tasks');
  assert(getAssignedTasks);
  const getTask = extractedQueries.find(q => q.name === 'get_task');
  assert(getTask);
  const getAssessments = extractedQueries.find(q => q.name === 'get_assessments');
  assert(getAssessments);
  const getAssessmentReport = extractedQueries.find(q => q.name === 'get_assessment_report');
  assert(getAssessmentReport);
  return {
    getAccount: getAccount.query,
    getAccounts: listAllUsers.query,
    getTemplates: getTemplates.query,
    getTemplate: getTemplate.query,
    insertEvent: insertEvent.query,
    getAssignedTasks: getAssignedTasks.query,
    getTask: getTask.query,
    getAssessments: getAssessments.query,
    getAssessmentReport: getAssessmentReport.query,
  }
})(joinPaths(__dirname, '../../database/queries'));

const initDb = (pool: Pool): Db => {
  return <Db>{
    listAllUsers: () => pool.query(queries.getAccounts)
                            .then(extractRows)
                            .then(wrapOk)
                            .catch(buildError),
    getUser: (id: UserId) => pool.query(queries.getAccount, [id, id])
                                 .then(extractRows)
                                 .then(headOrError)
                                 .then(wrapOk)
                                 .catch(buildError),
    templatesByUser: (id: UserId) => pool.query(queries.getTemplates, [id])
                                         .then(extractRows)
                                         .then(wrapOk)
                                         .catch(buildError),
    getTemplate: (onBehalfOf: UserId, id: TemplateId) => pool.query(queries.getTemplate, [onBehalfOf, id])
                                                             .then(extractRows)
                                                             .then(headOrError)
                                                             .then(wrapOk)
                                                             .catch(buildError),
    createTemplate: (onBehalfOf: UserId, name: string, content: string) => pool.query(queries.insertEvent, ['create_new_template', JSON.stringify({ name, content }), onBehalfOf])
                                                                               .then(extractRows)
                                                                               .then(headOrError)
                                                                               .then(row => keyOrError(keyOrError(row, 'insert_event'), 'templateId'))
                                                                               .then(wrapOk)
                                                                               .catch(buildError),
    replaceTemplate: (onBehalfOf: UserId, id: TemplateId, content: string) => pool.query(queries.insertEvent, ['replace_template', JSON.stringify({ templateId: id, content }), onBehalfOf])
                                                                                  .then(extractRows)
                                                                                  .then(headOrError)
                                                                                  .then(row => keyOrError(keyOrError(row, 'insert_event'), 'templateId'))
                                                                                  .then(wrapOk)
                                                                                  .catch(buildError),
    instantiateTemplate: (onBehalfOf: UserId, id: TemplateId, content: any) => pool.query(queries.insertEvent, ['instantiate_template', JSON.stringify({ templateId: id, content }), onBehalfOf])
                                                                                   .then(extractRows)
                                                                                   .then(headOrError)
                                                                                   .then(row => keyOrError(keyOrError(row, 'insert_event'), 'assessmentId'))
                                                                                   .then(wrapOk)
                                                                                   .catch(buildError),
    getAssignedTasks: (id: UserId) => pool.query(queries.getAssignedTasks, [ id ])
                                          .then(extractRows)
                                          .then(headOrError)
                                          .then(row => keyOrError(row, 'get_assigned_tasks_group_by_assessment'))
                                          .then(wrapOk)
                                          .catch(buildError),
    getTask: (id: TaskId, user: UserId) => pool.query(queries.getTask, [ id, user ])
                                               .then(extractRows)
                                               .then(headOrError)
                                               .then(row => keyOrError(row, 'get_task'))
                                               .then(wrapOk)
                                               .catch(buildError),
    submitSubmission: (onBehalfOf: UserId, tid: TaskId, submission: string) => pool.query(queries.insertEvent, ['submit_submission', JSON.stringify({ submission, taskId: tid }), onBehalfOf])
                                                                                   .then(extractRows)
                                                                                   .then(headOrError)
                                                                                   .then(row => keyOrError(keyOrError(row, 'insert_event'), 'submissionId'))
                                                                                   .then(wrapOk)
                                                                                   .catch(buildError),
    listAssessments: (id: UserId) => pool.query(queries.getAssessments, [ id ])
                                         .then(extractRows)
                                         .then(wrapOk)
                                         .catch(buildError),
    getAssessmentReport: (uid: UserId, id: AssessmentId) => pool.query(queries.getAssessmentReport, [ id, uid ])
                                                                .then(extractRows)
                                                                .then(headOrError)
                                                                .then(row => keyOrError(row, 'get_assessment_report'))
                                                                .then(wrapOk)
                                                                .catch(buildError),
    grantPermission: (onBehalfOf: UserId, id: Id, colony: ColonyId, permission: Permission) => pool.query(queries.insertEvent, ['grant_permission', JSON.stringify({ id, colony,  permission }), onBehalfOf])
                                                                                  .then(extractRows)
                                                                                  .then(headOrError)
                                                                                  .then(row => keyOrError(row, 'insert_event'))
                                                                                  .then(wrapOk)
                                                                                  .catch(buildError),
    revokePermission: (onBehalfOf: UserId, id: Id, colony: ColonyId, permission: Permission) => pool.query(queries.insertEvent, ['revoke_permission', JSON.stringify({ id, colony,  permission }), onBehalfOf])
                                                                                  .then(extractRows)
                                                                                  .then(headOrError)
                                                                                  .then(row => keyOrError(row, 'insert_event'))
                                                                                  .then(wrapOk)
                                                                                  .catch(buildError),
  };
};
