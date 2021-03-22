const { declare } = require('@babel/helper-plugin-utils');
const jsx = require('@babel/plugin-syntax-jsx').default;
const core = require('@babel/core');
const t = core.types;

/*
  遍历 JSX 标签，约定 node 为 JSXElement，如
  node = <view onTap={e => console.log('clicked')} visible>ABC<button>login</button></view>
*/
const handleJSXElement = (node) => {
  const tag = node.openingElement;
  const type = tag.name.name; // 获得表情名为 View
  const propertyes = []; // 储存对象的属性
  propertyes.push( // 获得属性 type = 'ABC'
    t.objectProperty(
      t.identifier('type'),
      t.stringLiteral(type)
    )
  );
  const attributes = tag.attributes || []; // 标签上的属性
  attributes.forEach(jsxAttr => { // 遍历标签上的属性
    switch (jsxAttr.type) {
      case 'JSXAttribute': { // 处理 JSX 属性
        const key = t.identifier(jsxAttr.name.name); // 得到属性 onTap、visible
        const convertAttributeValue = (node) => {
          if (t.isJSXExpressionContainer(node)) { // 属性的值为表达式（如函数）
            return node.expression; // 返回表达式
          }
          // 空值转化为 true, 如将 <view visible /> 转化为 { type: 'view', visible: true }
          if (node === null) {
            return t.booleanLiteral(true);
          }
          return node;
        }
        const value = convertAttributeValue(jsxAttr.value);
        propertyes.push( // 获得 { type: 'view', onTap: e => console.log('clicked'), visible: true }
          t.objectProperty(key, value)
        );
        break;
      }
    }
  });
  const children = node.children.map((e) => {
    switch(e.type) {
      case 'JSXElement': {
        return handleJSXElement(e); // 如果子元素有 JSX，便利 handleJSXElement 自身
      }
      case 'JSXText': {
        return t.stringLiteral(e.value); // 将字符串转化为字符
      }
    }
    return e;
  });
  propertyes.push( // 将 JSX 内的子元素转化为对象的 children 属性
    t.objectProperty(t.identifier('children'), t.arrayExpression(children))
  );
  const objectNode = t.objectExpression(propertyes); // 转化为 Object Node
  /* 最终转化为
  {
    "type": "view",
    "visible": true,
    "children": [
      "ABC",
      {
        "type": "button",
        "children": [
          "login"
        ]
      }
    ]
  }
  */
  return objectNode;
}

module.exports = declare((api, options) => {
  return {
    inherits: jsx, // 继承 Babel 提供的 jsx 解析基础
    visitor: {
      JSXElement(path) { // 遍历 JSX 标签，如：<view />
        // 将 JSX 标签转化为 Object
        path.replaceWith(handleJSXElement(path.node));
      },
    }
  }
});