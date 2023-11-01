/**
 * Defines an action object with a type, data, and meta properties.
 * @template Type - The type of the action.
 * @template Data - The data payload of the action.
 * @template Meta - The metadata of the action.
 */
type Action<Type extends string, Data = undefined, Meta = undefined> = Data extends undefined
  ? Meta extends undefined
    ? { type: Type }
    : { type: Type; meta: Meta }
  : Meta extends undefined
  ? { type: Type; data: Data }
  : { type: Type; data: Data; meta: Meta };


/**
 * Extender type for creating Redux actions with type, data, and meta properties.
 * @template Type - The type of the action.
 * @template Data - The data payload of the action.
 * @template Meta - The meta data of the action.
 * @property {string} type - The type of the action.
 * @property {(action: Action<Type, Data, Meta>) => action is Action<Type, Data, Meta>} matches - A function that returns true if the action matches the type.
 * @property {Action<Type, Data, Meta>} action - The action object.
 */
type Extender<Type extends string, Data = undefined, Meta = undefined> = Data extends undefined
  ? Meta extends undefined
    ? {
        type: Type;
        matches: (action: Action<Type>) => action is Action<Type>;
        action: Action<Type>;
      }
    : {
        type: Type;
        matches: (action: Action<Type, undefined, Meta>) => action is Action<Type, undefined, Meta>;
        action: Action<Type, undefined, Meta>;
      }
  : Meta extends undefined
  ? {
      type: Type;
      matches: (action: Action<Type, Data>) => action is Action<Type, Data>;
      action: Action<Type, Data>;
    }
  : {
      type: Type;
      matches: (action: Action<Type, Data, Meta>) => action is Action<Type, Data, Meta>;
      action: Action<Type, Data, Meta>;
    };

/**
 * Returns a function that creates an action object with the given type, data, and meta.
 * @template Type - The type of the action.
 * @template Data - The type of the data payload (optional).
 * @template Meta - The type of the meta payload (optional).
 * @param {Type} type - The type of the action.
 * @param {Data} data - The data payload (optional).
 * @param {Meta} meta - The meta payload (optional).
 * @returns {ActionCreatorReturn<Type, Data, Meta>} - The action creator function.
 */
type ActionCreatorReturn<
  Type extends string,
  Data = undefined,
  Meta = undefined
> = Data extends undefined
  ? Meta extends undefined
    ? (() => Action<Type>) & Extender<Type>
    : ((meta: Meta) => Action<Type, undefined, Meta>) & Extender<Type, undefined, Meta>
  : Meta extends undefined
  ? ((data: Data) => Action<Type, Data>) & Extender<Type, Data>
  : ((data: Data, meta: Meta) => Action<Type, Data, Meta>) & Extender<Type, Data, Meta>;

/**
 * Creates an action creator function that returns an action object with the given type, data, and meta.
 * @template Type - The type of the action.
 * @template Data - The type of the data payload (optional).
 * @template Meta - The type of the meta payload (optional).
 * @param {Type} type - The type of the action.
 * @param {Data} data - The data payload (optional).
 * @param {Meta} meta - The meta payload (optional).
 * @returns {ActionCreatorReturn<Type, Data, Meta>} - The action creator function.
 * @example
 * const myAction1 = createAction('MY_ACTION_1');
 * const myAction2 = createAction<string, string>('MY_ACTION_2');
 * const myAction3 = createAction<string, number>('MY_ACTION_3');
 * 
 * myAction1(); // { type: 'MY_ACTION_1' }
 * myAction1.matches({ type: 'MY_ACTION_1' }); // true
 * myAction1.matches({ type: 'MY_ACTION_2' }); // false
 * 
 * myAction2('Hello'); // { type: 'MY_ACTION_2', data: 'Hello' }
 * myAction2.matches({ type: 'MY_ACTION_2', data: 'Hello' }); // true
 * myAction2.matches({ type: 'MY_ACTION_2', data: 123 }); // false
 * 
 * myAction3('Hello', 123); // { type: 'MY_ACTION_3', data: 'Hello', meta: 123 }
 * myAction3.matches({ type: 'MY_ACTION_3', data: 'Hello', meta: 123 }); // true
 * myAction3.matches({ type: 'MY_ACTION_3', data: 'Hello', meta: '123' }); // false
 */
function createAction<Type extends string = string>(type: Type): ActionCreatorReturn<Type>;
function createAction<Data, Type extends string = string>(
  type: Type
): ActionCreatorReturn<Type, Data>;
function createAction<Data, Meta, Type extends string = string>(
  type: Type
): ActionCreatorReturn<Type, Data, Meta>;
function createAction<Data, Meta, Type extends string = string>(
  type: Type
): ActionCreatorReturn<Type, Data, Meta> {
  let _data: Data | undefined;
  let _meta: Meta | undefined;

  const caller = (data?: Data, meta?: Meta) => {
    if (data && meta) {
      _data = data;
      _meta = meta;
      return { type, data, meta };
    } else if (data) {
      _data = data;
      return { type, data };
    } else {
      return { type };
    }
  };
  caller.type = type;

  caller.matches = (action: { type: string }): action is Action<Type, Data, Meta> =>
    action.type === type;

  if (typeof _data !== 'undefined' && typeof _meta !== 'undefined') {
    caller.action = { type, data: _data, meta: _meta } as Action<Type, Data, Meta>;
  } else if (typeof _data !== 'undefined') {
    caller.action = { type, data: _data } as Action<Type, Data>;
  } else {
    caller.action = { type } as Action<Type>;
  }

  return caller as unknown as ActionCreatorReturn<Type, Data, Meta>;
}


export { createAction };
