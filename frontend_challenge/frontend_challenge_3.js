function commonParentNode(oNode1, oNode2) {

  // 仔细想想，是可以用递归做的，这是典型的递归题目！
  if (oNode1.contains(oNode2)) {
    return oNode1;
  } else {
    return commonParentNode(oNode1.parentNode, oNode2);
  }
/*
    //用oNode1.parentNode来获取节点，不要依赖于jQuery
    //1、找出两个节点的深度
    //2、令两个节点的深度相同
    //3、相同深度下再一层层地找最近的父节点
   if (oNode1 === null || oNode2 === null) {
    return null;
   }
   var depth1 = 1;
   var depth2 = 1;
   var rootNode = oNode1.ownerDocument;
   var node1 = oNode1.parentNode;
   var node2 = oNode2.parentNode;
   var offset;
   while (rootNode !== node1) {
     depth1++;
     node1 = node1.parentNode;
   }
   while (rootNode !== node2) {
     depth2++;
     node2 = node2.parentNode;
   }
   //令两个节点的深度一样
   if (Math.max(depth1, depth2) === depth1) {
     offset = depth1 - depth2;
     for (var i = 0; i < offset; i++) {
       oNode1 = oNode1.parentNode;
     }
   } else {
     offset = depth2 - depth1;
     for (var j = 0; j < offset; j++) {
       oNode2 = oNode2.parentNode;
     }
   }
   //当两个节点的深度一样时，再分别就其父节点进行比对
   //判断一下此时是否两个节点已经相同了，这说明
   if (oNode2 === oNode1) {
    return oNode1;
   }
   while (oNode1.parentNode !== oNode2.parentNode) {
     oNode2 = oNode2.parentNode;
     oNode1 = oNode1.parentNode;
   }
   return oNode1.parentNode;*/
}