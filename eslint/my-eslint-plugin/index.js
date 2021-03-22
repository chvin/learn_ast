module.exports.rules = { 
  "var-length": context => ({
    VariableDeclarator: (node) => { 
      if (node.id.name.length <= 1){ 
        context.report(node, '变量名长度需要大于1');
      }
    }
  })
};