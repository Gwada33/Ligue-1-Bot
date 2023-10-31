const { Client, CommandInteraction, MessageAttachment, MessageEmbed } = require("discord.js");
const axios = require('axios');
const puppeteer = require('puppeteer-core');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const express = require('express');

const app = express();
// Obtenez la date d'aujourd'hui
const aujourdhui = dayjs();
// Formatez la date au format "24 Janvier 2023"
const dateFormatee = aujourdhui.format('DD MMMM YYYY', { locale: 'fr' });
app.use(express.static('screenshot'));
app.listen('1999', function () {
    console.log('Express server listening on 1999')
})

module.exports = {
   name: "classement",
   description: "returns websocket ping",
   type: "CHAT_INPUT",
   run: async (client, interaction, args) => {
const apiUrl = 'https://apiv3.apifootball.com/?action=get_standings&league_id=168&APIkey=0d2512febb3c7487136249d0d7781f3554019bf8ccbb10be551e5a595c128a1a';
const BACKGROUND_IMAGE_URL = 'https://live.staticflickr.com/65535/53300267775_8a000abf84_h.jpg';

(async () => {
  const browser = await puppeteer.launch({ headless: "new", executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',  args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const PAGE_WIDTH = 1222 //633
  const PAGE_HEIGHT = 1456 //750

  await page.setViewport({ width: PAGE_WIDTH, height: PAGE_HEIGHT });
  
  // Charger une image de fond et configurer le style CSS
  try {
    const response = await axios.get(apiUrl);
    const teams = response.data;

    // Trier les équipes en fonction des points
    teams.sort((a, b) => parseInt(b.overall_league_PTS) - parseInt(a.overall_league_PTS));

    // Diviser les équipes en deux groupes de 9 équipes chacun
    const group1 = teams.slice(0, 9);
    const group2 = teams.slice(9, 18);

    // Générer le classement HTML avec Puppeteer en utilisant Flexbox et les styles CSS
    await page.setContent(`
      <style>
      @font-face {
        font-family:'Soliden';
        url('./SolidentrialBoldcondensed-Rpxp3.otf');
      }

        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          color: white;
        }

        img .bg {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          top: 0;
          left: 0;
          z-index: -1000;
        }

        .container {
          position: absolute;
          width: 72%;
          height: 75%;
          top: 0;
          left: 50px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 130px;
          margin-left: 80px;
          border: 1px solid yellow;

        }

        .column {
          display: flex;
          gap: 30px;
          flex-direction: column;
          align-items: center;
          border: 1px solid #green;
        }

        
        #teams1, #teams2 {
          display: flex;
          gap: 40px;
          margin-left: 10px;
          width: 120%;
          justify-content: center;
          flex-direction: column;
          border: 1px solid red;
        }

        #teams2 {
          transfrom: translateY(5%)
        }

        .team {
          display: flex;
          color: #FFFFFF;
          justify-content: space-between;
          align-items: center;
          flex-direction: row;
          gap: 14px;
          width: 100%;
          text-align: end;
          border: 1px solid #FFF;
          font-size: 20px;
        }

        .team .point{
          font-family: 'Soliden', sans-serif;
          font-weight: 800;
          font-size: 30px;
        }

        .team img {
          width: 70px;
          height: 70px;
        }
        
      </style>
      <img src=${BACKGROUND_IMAGE_URL} class="bg" alt="bg"  />
      <div class="container">
        <div class="column">
          <div id="teams1"></div>
        </div>
        <div class="column">
          <div id="teams2"></div>
        </div>
      </div>
    `);

    for (const team of group1) {
      const teamHTML = `
        <div class="team">
        <p>${team.overall_league_position}</p>
          <img src="${team.team_badge}" alt="${team.team_name} Logo">
         <p>${team.team_name}</p>
          <p class="point">${team.overall_league_PTS}</p>
        </div>
      `;

      await page.evaluate((teamHTML) => {
        const teamsDiv = document.getElementById('teams1');
        teamsDiv.innerHTML += teamHTML;
      }, teamHTML);
    }

    for (const team of group2) {
      const teamHTML = `
        <div class="team">
        <p>${team.overall_league_position}</p>
          <img src="${team.team_badge}" alt="${team.team_name} Logo">
          <p>${team.team_name}</p>
          <p class="point">${team.overall_league_PTS}</p>
        </div>
      `;

      await page.evaluate((teamHTML) => {
        const teamsDiv = document.getElementById('teams2');
        teamsDiv.innerHTML += teamHTML;
      }, teamHTML);
    }

    // Attendre un court instant pour s'assurer que les éléments sont rendus correctement
    await page.waitForTimeout(2000);

    // Prendre le screenshot
     await page.screenshot({ path: './screenshot/classement2.png' });
  } catch (error) {
    console.error('Erreur lors de la requête API :', error);
  } finally {
    // Fermer le navigateur
    await browser.close();
  }
})();

// Attendre la fin du chargement du screenshot avant de l'envoyer

// Créer une pièce jointe avec le fichier du screenshot
// Envoyer l'embed avec le fichier joint en tant que pièce jointe
  // Créer un nouvel embed
  const embed = new MessageEmbed()
  .setColor('#0099ff') // Couleur de l'embed (peut être n'importe quelle couleur)
  .setURL('http://localhost:1999/classement2.png')
  .setTitle(`Classement officiel Ligue 1 du ${dateFormatee}!`)
  .setDescription('Description de votre embed...') // Attache l'attachment à l'embed
  .setThumbnail('http://localhost:1999/classement2.png');

  await interaction.followUp({ content: `Classement officiel Ligue 1 du  **${dateFormatee}**!`, embeds: [embed] });
},
};
