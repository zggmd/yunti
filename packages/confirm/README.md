# 低码组件 - 确认弹框 confirm

用于弹框确认

---

### 使用方法

#### 绑定数据

在页面的 state 中 创建空对象，并绑定给 所有数据，例如:

```jsx
this.state.confirm;
```

#### 所有数据的属性

| 属性名  | 描述                             | 类型             | 默认值 |
| ------- | -------------------------------- | ---------------- | ------ |
| id      | 每次调用都需要生成新的 id        | string \| number | -      |
| title   | 标题                             | string           | -      |
| content | 内容                             | string           | -      |
| onOk    | 点击确定的回调方法，支持异步事件 | function         | -      |

#### 调用弹框

```jsx
this.setState({
  confirm: {
    id: new Date().getTime(), // 每次调用都需要生成新的id
    title: '删除数据集',
    content: `确定删除数据集？`,
    onOk: async () => {
      const res = await asyncAction();
      // do something
    },
  },
});
```
