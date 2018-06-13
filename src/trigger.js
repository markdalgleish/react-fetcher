import propName from './propName';

export default (name, components, locals) => {
  const promises = (Array.isArray(components) ? components : [components])

    // Filter out falsy components
    .filter(component => component)

    // Get component lifecycle hooks
    .map(component => ({ component, hooks: component[propName] }))

    // Filter out components that haven't been decorated
    .filter(({ hooks }) => hooks)

    // Calculate locals if required, execute hooks and store promises
    .map(({ component, hooks }) => {
      const hook = hooks[name];

      if (typeof hook !== 'function') {
        return;
      }

      try {
        const promise =
          typeof locals === 'function'
            ? hook(locals(component))
            : hook(locals);

        const isNoPromise = (promise && !promise.then) || !promise;

        const isDev =
          process && process.env && process.env.NODE_ENV === 'development';

        if (isNoPromise && isDev) {
          console.warn(
            'fetch does not return a promise. In this case redial execute "then" immediately and does not wait for async operations. Please check return (also implicit) of the defined fetch function.'
          );
        }

        return promise;
      } catch (err) {
        return Promise.reject(err);
      }
    });

  return Promise.all(promises);
};
