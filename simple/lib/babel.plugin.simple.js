module.exports = () => {
  return {
    visitor: {
      Identifier(path,) {
        // 三个前置判断
        if (path.node.name !== 'num') { // 变量需要为 num
          return;
        }
        if (path.parent.type !== 'FunctionDeclaration') { // 父级需要为函数
          return;
        }
        if (path.parent.id.name !== 'square') { // 函数名需要为 square
          return;
        }
        const referencePaths = path.scope.bindings['num'].referencePaths; // 找到对应的引用
        referencePaths.forEach(path => path.node.name = 'n'); // 修改引用值
        path.node.name = 'n'; // 修改自身的值
      }
    }
  }
};