/** ******************************** **/
/** ******* Environnements   ******* **/
/** ******************************** **/

const dialogFlowEnvs = {
    'production': 'Production',
    'recette': 'Recette',
    'qualification': 'Qualification'

};

function getParamEnv(params) {
    const env = params.env;
    return dialogFlowEnvs[env] || env;

}


module.exports.getParamEnv = getParamEnv;