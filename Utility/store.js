import Store from 'electron-store';

const schema = {
  browser: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      path: { type: 'string' }
    },
    default: {}
  }, 
  taskDetails: {
    type: 'object',
    properties: {
      missionsToday: {type: 'number'},
      timestamp: {type: 'number'},
      success: {type: 'number'},
      failure: {type: 'number'},
      aborted: {type: 'number'},
      tasks: {
        type: 'array',
        items: { 
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            count: { type: 'number'},
            timestamp: {type: 'number'},
            result: {type: 'string'}
          },
          default: {}
        },
        default: []
      },
    },
    default: {}
  }
};

const store = new Store({ schema });

export default store;