import _ from 'lodash';
import parse from './parse';
import render from './formatters';

const buildDiff = (obj1, obj2) => {
  const unionObj = { ...obj1, ...obj2 };
  return Object.keys(unionObj).reduce((acc, key) => {
    const option = {
      key,
      status: 'unchanged',
    };
    if (_.has(obj1, key) && !_.has(obj2, key)) {
      option.beforeValue = obj1[key];
      option.status = 'deleted';
    } else if (!_.has(obj1, key) && _.has(obj2, key)) {
      option.afterValue = obj2[key];
      option.status = 'added';
    } else if (_.has(obj1, key) && _.has(obj2, key)) {
      if (_.isObject(obj1[key]) && _.isObject(obj2[key])) {
        option.children = buildDiff(obj1[key], obj2[key]);
      } else {
        option.beforeValue = obj1[key];
        option.afterValue = obj2[key];
        if (obj1[key] !== obj2[key]) {
          option.status = 'changed';
        }
      }
    }
    return [...acc, option];
  }, []);
};

export default (firstConfig, secondConfig, format = 'pretty') => {
  const beforeObject = parse(firstConfig);
  const afterObject = parse(secondConfig);
  const diff = buildDiff(beforeObject, afterObject);
  return render(diff, format);
};
