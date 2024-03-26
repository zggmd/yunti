import { IPublicTypeProjectPageSchema } from '@/types';

const PageSchema: IPublicTypeProjectPageSchema = {
  version: '1.0.0',
  componentsMap: [],
  componentsTree: [
    {
      componentName: 'Page',
      id: '<replace me>',
      meta: {
        title: '<replace me>',
        router: '<replace me>',
      },
      fileName: '<replace me>',
      props: {},
      state: {},
      css: 'body {\n  font-size: 12px;\n}\n',
      lifeCycles: {
        componentDidMount: {
          type: 'JSFunction',
          value: "function componentDidMount() {\n  console.log('did mount');\n}",
          source: "function componentDidMount() {\n  console.log('did mount');\n}",
        },
        componentWillUnmount: {
          type: 'JSFunction',
          value: "function componentWillUnmount() {\n  console.log('will unmount');\n}",
          source: "function componentWillUnmount() {\n  console.log('will unmount');\n}",
        },
      },
      methods: {},
      hidden: false,
      title: '',
      isLocked: false,
      condition: true,
      conditionGroup: '',
    },
  ],
};

export default PageSchema;
