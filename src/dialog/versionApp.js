const log = require('../logger');

const { BasicCard, BrowseCarousel, BrowseCarouselItem} = require('actions-on-google');

const versionDAO = require('../dao/versionAppDAO');

function versionApp(conv, {app, env} ) {
    return versionDAO.getVersion(app, env).then(data => {
        const version = data.Version;
        const date = data.Date;
        let text;
        if (!version) {
            text = `La version de cette application n'a pas été trouvée `;
        } else {
            text = `La ${env} de ${app} est en version ${version} `;
        }
//         conv.ask(new BasicCard({
//             "title": `Application ${app}`,
//             "subtitle": `Environnement de ${envLabel}`,
//             "text": `**Buildée le** ${date}
// **Commit** ${data.Commit}`
//         }));

        // Create a browse carousel
        // conv.ask(new BrowseCarousel({
        //     items: [
        //         new BrowseCarouselItem({
        //             title: `${env} de ${app}`,
        //             url: data.url,
        //             description: 'Description of item 1',
        //             footer: data.url,
        //         }),
        //         new BrowseCarouselItem({
        //             title: 'Title of item 2',
        //             url: data.url,
        //             description: 'Description of item 2',
        //             footer: 'Item 2 footer',
        //         }),
        //     ],
        // }));
        return conv.ask(text);
    });
}

module.exports.versionApp = versionApp;