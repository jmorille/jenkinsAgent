exports.index = ctx =>{
  ctx.body = {
      service: "Jenkins Agent"
  }
};

exports.intent = ctx => {
    const req = ctx.request.body;
   // console.log( req.result );
   // console.log( req.result.metadata );
    const dialog = req.result.metadata;

    const intentName = dialog.intentName;
    const matchedParameters = dialog.matchedParameters;
    console.log(intentName, matchedParameters);
    ctx.body = req.fulfillment;
    //"speech" is the spoken version of the response, "displayText" is the visual version
};