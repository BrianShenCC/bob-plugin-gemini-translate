function createContext() {
  let context = [];
  return {
    get: () => context,
    clear: () => {
      context = [];
    },
  };
}

const context = createContext();

exports.context = context;
