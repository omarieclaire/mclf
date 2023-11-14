// Function to set content and update active labels
function setContentAndLabels(element, dataArray, slider, labels) {
  element.innerHTML = dataArray[slider.value];
  labels.forEach((label, index) => {
    label.classList.toggle("active", index === parseInt(slider.value));
  });
}

const bios = [
  //shortest
  `<p><a href="https://marieflanagan.com/">Marie LeBlanc Flanagan</a> is an artist working in the playful spaces between people, especially related to connection and community.</p>`,
  //short
  `<p>
      <a href="https://marieflanagan.com/">Marie LeBlanc Flanagan</a> is an artist working in the playful spaces between people, especially related to connection and community. Marie builds experimental video games, playful installations, and cooperative experiences and has an enduring fondness for the possibilities of trash.</p>`,
  //medium
  `<p>
    <a href="http://marieflanagan.com/">Marie LeBlanc Flanagan</a> is an artist working in the playful spaces between people, especially related to connection and community. Marie builds experimental video games, playful installations, and cooperative experiences and has an enduring fondness for the possibilities of trash.</p>
    <p>Marie co-founded <a href="https://wyrdartsinitiatives.org/">Wyrd Arts Initiatives</a>; 
    <a href="http://droneday.org/">founded Drone Day</a>; served as the editor-in-chief of <a href="https://weirdcanada.com/">Weird Canada;</a> 
    co-founded <a href="https://imaginaryresidency.com/">Imaginary Residency</a>, an artist-run online residency; 
    co-founded <a href="https://torontogamesweek.com/">Toronto Games Week</a>; 
    and co-organizes <a href="http://gaiasymposium.net/">GAIA</a>.</p> 
  
    <p>Marie has worked with <a href="https://wizardzines.com/">Wizard Zines</a>, 
    <a href="https://2021.amaze-berlin.de/">A MAZE. Berlin</a> International Games and Playful Media Festival, 
    <a href="https://processingfoundation.org/">The Processing Foundation</a>,
    <a href="https://www.schoolofma.org/">The School of Machines, Making, and Make-Believe</a>, 
    <a href="https://www.ada-x.org/">Ada x</a>, 
    <a href="https://www.dailytouslesjours.com/en">Daily Tous Les Jours</a>, 
    and <a href="https://gameartsinternational.network/">Game Arts International Network</a>.</p>`,

  //long
  `<p>
    <a href="http://marieflanagan.com/">Marie LeBlanc Flanagan</a> is an artist working in the playful spaces between people, especially related to connection and community. Marie builds experimental video games, playful installations, and cooperative experiences and has an enduring fondness for the possibilities of trash.</p>
    <p>Marie co-founded <a href="https://wyrdartsinitiatives.org/">Wyrd Arts Initiatives</a>, a nonprofit dedicated to encouraging, documenting, and connecting creative expression across Canada; 
    <a href="http://droneday.org/">founded Drone Day</a>, an annual international celebration of drone music communities; served as the editor-in-chief of <a href="https://weirdcanada.com/">Weird Canada;</a> 
    co-founded <a href="https://imaginaryresidency.com/">Imaginary Residency</a>, an artist-run online residency; 
    co-founded <a href="https://torontogamesweek.com/">Toronto Games Week</a>; 
    and co-organizes <a href="http://gaiasymposium.net/">GAIA</a>, a global biennial gathering of playful curators.</p> 
  
    <p>Marie has worked with and works with <a href="https://wizardzines.com/">Wizard Zines</a>, 
    <a href="https://2021.amaze-berlin.de/">A MAZE. Berlin</a> International Games and Playful Media Festival, 
    <a href="https://processingfoundation.org/">The Processing Foundation</a>,
    <a href="https://www.schoolofma.org/">The School of Machines, Making, and Make-Believe</a>, 
    <a href="https://www.ada-x.org/">Ada x</a>, 
    <a href="https://www.dailytouslesjours.com/en">Daily Tous Les Jours</a>, 
    and <a href="https://gameartsinternational.network/">Game Arts International Network</a>.</p>
  `,
  //longest
  `<p>
      <a href="http://marieflanagan.com/">Marie LeBlanc Flanagan</a> is an artist working in the playful spaces between people, especially related to connection and community. Marie builds experimental video games, playful installations, and cooperative experiences and has an enduring fondness for the possibilities of trash.</p>
      <p>Marie co-founded <a href="https://wyrdartsinitiatives.org/">Wyrd Arts Initiatives</a>, a nonprofit dedicated to encouraging, documenting, and connecting creative expression across Canada; 
      <a href="http://droneday.org/">founded Drone Day</a>, an annual international celebration of drone music communities; served as the editor-in-chief of <a href="https://weirdcanada.com/">Weird Canada;</a> 
      co-founded <a href="https://imaginaryresidency.com/">Imaginary Residency</a>, an artist-run online residency; 
      co-founded <a href="https://torontogamesweek.com/">Toronto Games Week</a>; 
      and co-organizes <a href="http://gaiasymposium.net/">GAIA</a>, a global biennial gathering of playful curators.</p> 
    
      <p>Marie has worked with and works with <a href="https://wizardzines.com/">Wizard Zines</a>, 
      <a href="https://2021.amaze-berlin.de/">A MAZE. Berlin</a> International Games and Playful Media Festival, 
      <a href="https://processingfoundation.org/">The Processing Foundation</a>,
      <a href="https://www.schoolofma.org/">The School of Machines, Making, and Make-Believe</a>, 
      <a href="https://www.ada-x.org/">Ada x</a>, 
      <a href="https://www.dailytouslesjours.com/en">Daily Tous Les Jours</a>, 
      and <a href="https://gameartsinternational.network/">Game Arts International Network</a>.</p>
      <p>
        Marie has
         spoken, shared work, and taught workshops in South America, North
         America, Africa, and Europe. Marie has completed artist residencies
         at the <a href="https://gamecenter.nyu.edu/">NYU Game Center</a>, at
         <a href="https://tag.hexagram.ca/">Technoculture, Art and Games</a>,
         with SoftieFeelies, and at
         <a href="https://livelab.mcmaster.ca/">LiveLab</a>.
        </p>
         
        <p>
         Marie is on the board of
         <a href="https://www.interartsmatrix.ca/">Inter Arts Matrix</a>; the
         <a href="https://easternbloc.ca/fr">Eastern Bloc</a> artistic
         programming committee; and has served as a
         <a href="https://polarismusicprize.ca/">Polaris Prize</a> Juror.</p>`,
];

const bioSlider = document.getElementById("bio-slider");
const bioText = document.getElementById("bio-text");
const sliderLabels = document.querySelectorAll(".slider-labels span");

bioSlider.addEventListener("input", () => {
  setContentAndLabels(bioText, bios, bioSlider, sliderLabels);
});

// Add click event listeners to the labels
sliderLabels.forEach((label, index) => {
  label.addEventListener("click", () => {
    bioSlider.value = index; // Update the slider value
    setContentAndLabels(bioText, bios, bioSlider, sliderLabels);
  });
});

// Set default slider value to Medium
bioSlider.value = 2;

// Initialize bio content
setContentAndLabels(bioText, bios, bioSlider, sliderLabels);

const timelines = [
  //2023
  `<p> <span class="year">In the delicious year of 2023:</span> 
  I did an artist residency at the <a target="_blank" href="https://www.etc.cmu.edu/">Entertainment Technology Center</a> at Carnegie Mellon University with a field trip to NYC and created a game-poem with <a target="_blank" href="https://en.wikipedia.org/wiki/Heather_Kelley">Heather Kelley</a> and other collaborators that we showed at <a target="_blank" href="https://likelike.org/2023/03/01/grow-still/">LIKELIKE.</a> 
  ☀ I co-founded <a target="_blank" href="https://torontogamesweek.com/">Toronto Games Week</a>, a celebration of playable arts and culture <a target="_blank" href="https://gameartsinternational.network/toronto-games-week/">organized with local games enthusiasts and community organizers</a> and <a target="_blank" href="https://nomediakings.org/">Jim Munroe</a> 
  ☀ I co-organized <a target="_blank" href="http://gaiasymposium.net/">the GAIA Symposium</a>, an international think tank and network for the <a target="_blank" href="https://gameartsinternational.network/a-look-back-at-gaia-2023/">professional development of the game arts community:</a> aimed at curators, producers, event organizers and academics. 
  ☀ I researched, wrote, and illustrated <a target="_blank" href="https://gameartsinternational.network/if-you-dont-like-the-game-change-the-rules/">If you don't like the game, change the rules</a> with extensive research support from <a target="_blank" href="https://michaeliantorno.com/">Michael Iantorno</a>, 
  a surprisingly controversial comic about co-ops, unions, and work in the games industry (not everyone loves unions).
   ☀ I started a "Montreal Cultural Calendar" group and <a target="_blank" href="https://calendar.google.com/calendar/u/0?cid=MWY2MDllMGFjZjhhZWY3MGE0MzY4NDkyZDFmMWI3MzhmMjg3ZmI3OWIwNWY0YzgwMzVkYzdiNThmNmVjNGZmNUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t">calendar</a> and may have thereby magically built myself a community. 
   ☀ I co-organized <a target="_blank" href="https://ccfest.rocks/virtual-cc-fest-june-18">Virtual Creative Code Fest (CC Fest)</a>, a free & friendly event for anyone curious about creative code with workshops on pixel art, music, color, and arduino with <a target="_blank" href="https://www.edsaber.info/">Saber Khan</a> 
   ☀ I made music! Mostly with voice, found sounds, guitar, synth and Frank's <a target="_blank" href="https://en.wikipedia.org/wiki/LinnDrum">LinnDrum</a>, and also with <a target="_blank" href="https://store.lom.audio/products/geofon">something that measures seismic vibrations</a>. 
   ☀ I learned how to use the laser-cutter (better) and embroidery machine at the local makerspace. ☀ I continue to serve on the <a target="_blank" href="https://www.instagram.com/easternblocmtl/">Eastern Bloc</a> programming commitee. ☀ I travelled to Mexico City for <a target="_blank" href="https://oasis.esne.es/">OASIS</a> <a target="_blank" href="https://www.cenart.gob.mx/">CENART in Ciudad de Mexico</a> (thanks to the Canadian Embassy and <a target="_blank" href="https://mexico.sae.edu/">SAE Institute Mexico</a>) and gave two artist talks about my work and research into work and play. 
   ☀ I travelled to Halifax to host a <a target="_blank" href="http://eyelevel.art/post/change-rules-collaborative-zine-making-workshop-and-artist-panel-marie-leblanc-flanagan">collaborative zine-making workshop</a> and <a target="_blank" href="http://eyelevel.art/post/change-rules-collaborative-zine-making-workshop-and-artist-panel-marie-leblanc-flanagan">Artist Panel x Labour Rights</a> with <a target="_blank" href="LINK">Eyelevel Gallery</a> , and to Lunenburg to scheme new collaborations with Cat Bluemke and Jonathan Carroll of <a target="_blank" href="http://www.catbluemke.com/spekwork.html">SpekWork Studio</a>. 
   ☀ I paired with <a target="_blank" href="https://jvns.ca/">Julia Evans</a> to create <a target="_blank" href="https://wizardzines.com/zines/integers-floats/">How Integers and Floats Work</a>, where we explore the weird ways your computer does math, like how 0.1 + 0.2 somehow is equals 0.30000000000000004? ☀ I had some big personal life changes and I didn't die. 
   ☀ I grew peas and peppers but the squirrels ate all my tomatoes as always, just one bite and they toss them. ☀ We celebrated the 9th annual <a target="_blank" href="http://droneday.org/">Drone Day</a>. ☀ I drew hundreds of creatures. ☀ I adventured into a DIY citizen science retreat in Muskoka with <a target="_blank" href="https://leecyb.org/">Lee Cyborg</a>, <a target="_blank" href="https://hillarypredko.com/">Hillary Predko</a>, Nadine, Kamal, Julia, Dave, and company.
   ☀ I travelled to Oakland, Point Arena, and Los Angeles where I made zines, animation flipbooks, and started an eclipse whale game with <a target="_blank" href="http://cabbibo.com/">Cabbibo</a> and <a target="_blank" href="https://www.twitch.tv/pendletonward">Pen Ward.</a> Year's not over yet! Soon I'll be headed to Vancouver, Taipei, Tokyo, and Kyoto.</p>`,
  //2022
  `<p> <span class="year">In the transformative year of 2022:</span> 
  I did a residency at the Société des arts technologiques <a target="_blank" href="https://sat.qc.ca/en/metalab">Metalab</a> and made <a target="_blank" href="https://marieflanagan.com/come-with-me/">ComeWithMe</a>, a game exploring connection and the spaces between people (I wrote a <a target="_blank" href="https://marieflanagan.com/stuck/">blog post about getting stuck</a> along the way). 
  ☀ I created <a target="_blank" href="https://tendercircuits.ca/home/indexx/">Tender Circuits</a>, a web experience documenting the work of artists exploring the concept of connection and fungal intelligence through participating in AR app development for <a target="_blank" href="https://digitalartsresourcecentre.ca/">Digital Arts Resource Centre (DARC)</a>. 
  ☀ I co-created <a target="_blank" href="https://www.instagram.com/p/Cd1LID2pTDi/">Song of the Soil</a> with Dirtpunk (Henry Driver, Rebecka Pettersson, Ashley Cho, and Sacha Holsnyder) about <a target="_blank" href="https://instagram.com/p/CdEIKmNpg6o/">microbes and fungus</a> and the beauty of <a target="_blank" href="https://twitter.com/omarieclaire/status/1521181177704558594">soil</a> for <a target="_blank" href="https://www.indiecade.com/">IndieCade's</a> Climate Jam, and we won the Most Adventurous/Innovative award 
  ☀ I worked with Leslie Ting to create <a target="_blank" href="http://summerworks.ca/show/what-brings-you-in/">What Brings You In</a>, an interactive online show with music, live narration, guest voices, and playful interactions.  ☀ I worked with <a target="_blank" href="https://adelheid.ca/welcome">adelheid</a> on <a target="_blank" href="https://adelheid.ca/in-development">You are swimming here</a>, an AR exploration of the human and natural histories that exist in our shared spaces. ☀ We celebrated the 8th annual <a target="_blank" href="http://droneday.org/">Drone Day</a>, and I organized the first ever <a target="_blank" href="https://itch.io/jam/drone">Drone Jam</a>, where we made experimental games, toys, or playful things related to the idea of sustained tones. You can play the <a target="_blank" href="https://droneday.org/play.html">drone games here</a>. 
  ☀ I worked with <a target="_blank" href="https://truluv.ai/">TruLuv</a> on Design for <a target="_blank" href="https://truluv.ai/selfcare">#SelfCare</a>, incorporating rituals to deepen care, compassion, and connection. ☀ I co-organized <a target="_blank" href="https://ccfest.rocks/virtual-cc-fest-june-18">Virtual Creative Code Fest (CC Fest)</a>, a free & friendly event for anyone curious about creative code with workshops on pixel art, music, color, and arduino with <a target="_blank" href="https://www.edsaber.info/">Saber Khan</a> ☀ I hosted a play session for artists few events for artists ​​exploring feelings around ai / ethics / being here now as we tried out new AI tools.  
  ☀ I co-organized with Ada X, and InterAccess <a target="_blank" href="https://interaccess.org/event/2022/ctrlshift-data-sovereignty-community-action">Ctrl+Shift: Data Sovereignty & Community Action</a>, conversations about listening, inquiring, contemplating, and consent-building in the age of digital giants. 
  ☀ I hosted conversations with <a target="_blank" href="https://interartsmatrix.ca/x-camera-talks/v/fp4tga4fbxtnbnsp98zjfffx975j2w">Grace Scheele: not yr angel bby harpist</a>, <a target="_blank" href="https://interartsmatrix.ca/x-camera-talks/v/e4lmf7fg4alnrhsssjpnp2yyykfwtk">Viktorija Kovac: Theatre of Heartbreak(s)</a>, <a target="_blank" href="https://interartsmatrix.ca/x-camera-talks/v/lbjd57kr34jt69dm9kwb32y8dfsm26">Sam Mercury: mixed(er)</a>, <a target="_blank" href="https://interartsmatrix.ca/x-camera-talks/v/ltpe2se4nxr9j8tredarjtb5ej6am5">Andrew Jacob Rinehart: Searching for Stillness through Radical Play</a>, <a target="_blank" href="https://interartsmatrix.ca/x-camera-talks/v/d76t6l3h9m2c4cn9mrkpsa5rfdzl76">Kate Kamo McHugh: Seeds of Reclamation</a>, and <a target="_blank" href="https://interartsmatrix.ca/x-camera-talks/v/gc3c2nlfe4hwyd735f9cgl6jhrwkmf">Lauren Prousky: When we speak at the same time, we speak the same language</a> in the <a target="_blank" href="https://interartsmatrix.ca/x-camera-talks">X-Camera</a> series to discuss their artistic practice. 
  ☀ I continued to serve on the <a target="_blank" href="https://www.instagram.com/easternblocmtl/">Eastern Bloc</a> programming commitee.
  ☀ I organized a series of workshops called "playsessions" on making experimental games, including <a target="_blank" href="https://interartsmatrix.ca/events/concentric-fictions">Concentric Fictions</a> with <a target="_blank" href="https://oleomingus.com/about-1">Dhruv Jani</a>, exploring magical realism, experimentation, and nonsense verse; <a target="_blank" href="https://interartsmatrix.ca/events/weird-theatre-games">Weird Theatre Games</a>, a workshop about transforming emotionally challenging situations into one-of-a-kind awkward theatre games with <a target="_blank" href="https://squinky.me/">D. Squinkifer</a>, <a target="_blank" href="https://interartsmatrix.ca/events/making-it-work-tools-modes-for-interactive-experiences">Making It Work: Tools & Modes for Interactive Experiences</a>, a workshop about designing playful interactive experiences with <a target="_blank" href="https://jeka.games/">Jess Rowan Marcotte</a>, and <a target="_blank" href="https://interartsmatrix.ca/events/create-your-own-biomorphic-world-in-blender-with-shonee">Create your own biomorphic world in Blender</a> with <a target="_blank" href="https://www.instagram.com/shhonee/?hl=en">Shonee</a>.
  ☀ I created a series of sessions on funding games, including <a target="_blank" href="https://interartsmatrix.ca/events/how-to-start-an-indie-game-without-going-into-debt-or-burning-out">How to Finance Your Game without Going into Debt</a>, a workshop about financing games for small indie game studios with <a target="_blank" href="https://achimogames.ca/">Meagan Byrne</a>, <a target="_blank" href="https://interartsmatrix.ca/events/fund-your-game-ontario-creates">Fund! Your! Game! with Kim Gibson from Ontario Creates</a>, <a target="_blank" href="LINK">XXX</a>, <a target="_blank" href="https://interartsmatrix.ca/events/fund-your-game-with-megan-leduc-from-canada-council-for-the-arts">Fund! Your! Game! with Megan Leduc from Canada Council for the Arts</a>, and <a target="_blank" href="https://interartsmatrix.ca/events/fund-your-game-with-mark-and-zhe-from-ontario-arts-council">Fund! Your! Game! with Mark and Zhe from Ontario Arts Council</a>
  ☀ 
I co-hosted a series of conversations with Edith about Ideas 
  ☀ Something called Playful questions? (a casual open discussion series) 
  ☀ 
I created a <a target="_blank" href="https://artistseekscrowd.com/zine.html">64-page zine</a> (book?!) documenting the entire <a href="https://interartsmatrix.ca/projects/cove-covox">COVE/COVOX</a> project.  
  ☀ 
I created a <a target="_blank" href="http://www.artistseekscrowd.com">playful site exploring the idea of digital audience engagement</a>, based on the mood-ring project. 
  ☀ 
I did research on the TouchingYou project, exploring softness, touch and connection grounding “knowledge” in lived experience, somatics, and play. 

  I spoke at <a target="_blank" href="https://octobre-numerique.fr/">Festival Octobre Numérique Faire Monde</a> in Arles.
  I spoke in Barcelona.

 </p>`,

  //2021
  `<p> <span class="year">In the generative year of 2021:</span> 
  ☀ I created <a href="https://marieflanagan.com/softiee/">Soft Sanctuary</a> for <a href="https://proyectobios.com/">Proyecto Bios</a> in Argentina, a peaceful web space for slow connection, through interactive question prompt, 3D sculptures, and soft sounds with the support of the Canadian Embassy. 
  ☀ I co-organized the <a href="https://gaiasymposium.net/">Game Arts International Assembly (GAIA)</a> Online, a 9-session online conference event for 150+ game curators around the world, focused on interconnecting existing game arts organizations and nurturing new structures in emerging regions. 
  ☀ I ran <a target="_blank" href="https://milieux.concordia.ca/event/hypo-hyper-presence-workshop-n%CB%9A-1-filters-with-marie-leblanc-flanagan/">HYPO//HYPER PRESENCE N˚ 1: FILTERS</a>, an Augmented Realities workshop at the Milieux Institute.
  ☀ I moderated and hosted AI The End, a conversation with <a target="_blank" href="https://www.ada-x.org/en/activities/ai-the-end-gina-hara-residency-presentation/">Gina Hara</a> at <a target="_blank" href="https://www.ada-x.org/en/">Ada X</a>.
  ☀ I co-ran an edition of the <a target="_blank" href="https://imaginaryresidency.com/">Imaginary Residency</a> (March 6th-April 10th) with <a href="https://memcpy.io/">Robert Foss</a>, <a href="mailto:nick@nanocat.net">Nick Morrison</a>, <a href="https://twitter.com/saganyee">Sagan Yee </a>, <a href="https://kofioduro.myportfolio.com/links">Kofi Oduro</a>, <a href="https://www.are.na/amused-av">Marie Dahlén</a>,  <a href="mailto:tempest@ualberta">eryn</a>, <a href="mailto:dahjac@gmail.com">Jack</a>, <a target="_blank" href="https://www.truekvlt.com/">Jay Palmer</a>, <a target="_blank" href="https://xin-xin.info/">Xin Xin</a>and <a target="_blank" href="https://www.ada-x.org/en/participants/liane-decary-chen/">Liane Décary-Chen</a>. ☀
  ☀ I co-led the Tech Tech Tech project exploring alternatives to the Tech Giants Ada X Montreal, which included deep research, interviews, a 4-part workshop with co-researchers exploring alternatives for office tools, social media, online gatherings, portfolios, performances & exhibitions. At the end I wrote and pubished two zines: Living in the time of tech giants and Finding our way. 
☀ I worked with <a target="_blank" href="https://www.instagram.com/longwinterto/">Long Winter</a>, on customization and extensions of a virtual platform ☀ 
☀ I made ​Mess With DNS with Julia Evans, an online resource to learn about Domain Name Systems through playful experiments.
☀ I worked with Julia to create a zine about <a href="https://marieflanagan.com/how-dns-works">How DNS Works</a> 
☀ I created a feedback site with Julia Evans, allowing for feedback on Zines.
☀ I worked with Gros Morne Summer Music (GMSM) to create Mummer’s Journey, a musical web experience. A virtual, 3D immersive version of the community of Woody Point acts as an online interactive advent calendar experience.  
☀ I co-ran another edition of the <a target="_blank" href="https://imaginaryresidency.com/">Imaginary Residency</a>, an open-source collaborative artist residency from (March 6th -April 10th) with <a href="https://palomadawkins.com/">Paloma Dawkins</a>, <a href="https://www.ethanmuller.com/">Ethan Muller</a>, <a href="https://cabbi.bo/">Cabbibo</a>, and <a href="https://en.wikipedia.org/wiki/Nathalie_Lawhead">nathalie lawhead</a>. ☀ 
☀ Was this the year of the NUMANS workshop?
☀ Imaginary residency also ran a special collaboration and made We dance with space owl. 
  ☀ I worked with Leslie Ting to create <a target="_blank" href="https://www.leslieting.com/speculation">Speculation</a>, a theatrical concert with an immersive visual design based on the experience of vision loss.  
  ☀ I made my very own social media, called "Friend News". I wrote and never shared "Dimensions of Online Spaces", because I couldn't find funding or space to finish developing the ideas. 
  ☀ I ran a series of workshops on interactivity, experience, and ritual for Escapism with <a target="_blank" href="https://avita.space/">Avita Maheen</a>, <a target="_blank" href="https://oyoun.de/en/profil/tea-boyarchuk/">Téa Boyarchuk</a>, <a target="_blank" href="https://oyoun.de/en/tag/sol-martinez-sole/">Sol Martínez Solé</a>, and <a target="_blank" href="https://www.izdiharafyouni.com/">Izdihar Afyouni</a><a target="_blank" href="https://oyoun.de/">Oyoun  - Kultur NeuDenken</a>Oyoun
  ☀ I contributed my thoughts to <a target="_blank" href="https://onm.art/">Offer Need Machine</a>, part of Artengine’s Digital Economies Lab’s objective to interrogate issues
around precariousness in the creative community.
☀ I gave a talk for the at <a target="_blank" href="https://gutefabrik.com/">Die Gute Fabrik</a> Practice Sessions.
☀ I worked with the <a target="_blank" href="https://liveness.milieux.ca/">LIVENESS Research Group</a> exploring the intersections of liveness, game structures and rules, and the digital.
☀ I co-led machine learning workshops with <a target="_blank" href="https://genielab.co/en/">GenieLab</a>.
☀ I ran the 8th edition of <a href="https://droneday.org/">Drone Day</a>, an annual celebration of drone, community, and experimental sounds. 
☀ I organized a very unsucessful event called Parallel park play- A tiny gathering for us to play alongside each other.</p>
☀ I hosted exploratory sessions called NoWorking, an online series of sessions dedicated to not working, and challenging ideas around labour. 
☀ I contributed to the Processing Org 20th Anniversary Community Catalog Contributor, a community catalog to celebrate 20 years of Processing. 
☀ I contributed to the Game Arts Curators Kit, a seventy page handbook for anyone interested in bringing a curatorial eye to the presentation of video games. 
☀ I researched, wrote, and illustrated Isolation Nation with the support of GAIN, the CMF, and OC, a free resource for tips and tricks culled from 70 Canadian game creators. 
 ☀ To the delight of my mom, I spoke on The Current (CBC) exploring creative ways for people to connect online. 
  ☀ I did a special intensive residency/retreat with Cabbibo, Sean, Hayden, Cherrie, and Jack. I served as a mentor for Pixelles. I served on the Inter Arts Matrix: Birthplace of Hybrid Art board. I served on the Eastern Bloc programming committee. ☀ 
I did an interview about drone sounds? 2021: Buzz about drones - the aural kind - gets kids excited about learning twitter  
</p>`,
  //2020
  `<p> <span class="year">In the unspeakable year of 2020:</span> 
I showed Closer in Toronto. I organized an Experimental Gathering. Then the pandemic hit.  
☀ 
  I made Throne Room, a virtual bathroon for people to collaboratively graffiti and deface at <a href="https://2023.amaze-berlin.de/">A MAZE. Berlin</a>, and for people to consider what they flush away. ☀ 

  ☀ I co-organized <a target="_blank" href="https://ccfest.rocks/virtual-cc-fest-june-18">Future Tense: Virtual Creative Code Fest (CC Fest)</a>, a free & friendly event for anyone curious about creative code with workshops on pixel art, music, color, and arduino with <a target="_blank" href="https://www.edsaber.info/">Saber Khan</a> 

  I made <a target="_blank" href="https://mood-ring.ca/">Mood Ring</a> with Emily, Rachel, and ? for <a target="_blank" href="https://www.debaser.ca/">Debaser/a>. ☀ 

  I made Special Guest with a collaborative team of international artists, an experimental marketplace for booking playful guests to improve online meetings, and an invitation to imagine other ways of gathering. ☀ 

  I made <a target="_blank" href="https://marieflanagan.com/neighbourbot/">Neighbourbot</a> with Julia Evans for <a href="https://bangbangcon.com/index.html">!!Con 2020</a>. The idea was to make space for short spontaneous connections with neighbours at online events. ☀ 
  
  2020 Lungbutter | "Curtain" Music Video, Performer ☀ 

  2020 Sound Games (Web), Collection of playful connections to sound for <a target="_blank" href="https://droneday.org/">Drone Day</a>. Conceptual art in the form of tiny games inviting people to get intimate, playful, and curious about their relationship to sound. ☀ 

  I worked with the <a target="_blank" href="https://liveness.milieux.ca/">LIVENESS Research Group</a> on Scaling Liveness in Participatory Experiences
.

  2020 Collaborative Drawing with Isabella and Nomi.  ☀ 

  2020: Online Spaces - Event series exploring online spaces together. ☀ 
  
  2020 FemTech Online Hangs - with the feminist online org. ☀ 
  
  2020 Experimental Gatherings - Inspiration Show & Tell. ☀ 

I taught a class at <a target="_blank" href="https://www.schoolofma.org/">The School of Machines, Making, and Make-Believe</a>, 

  2020: Now & Next podcast. ☀ 

  2020 Softie Feelies (Online) Interdisciplinary Artist Residency ☀ 

  2020 A MAZE. Berlin (Online) Throne Room ☀ 
<p>433 with Leslie?</p>
  2020 Living Arts (Mississauga, Canada) ☀ 
  
  
  </p>`,
  //2019
  // `<p>Lungbutter? New York: Artist in Residence at the <a target="_blank" href="https://gamecenter.nyu.edu/">NYU Game Center</a></p>`,
  //2018
  // `<p>I built a one-month city-wide play experience for CAFKA in Kitchener-Waterloo. To Montreal to do an artist residency at <a target="_blank" href="https://tag.hexagram.ca/">Technoculture, Art and Games</a>. I consulted with <a target="_blank" href="http://www.dailytouslesjours.com/">Daily Tous Les Jours</a> and <a target="_blank" href="https://www.genielab.co/">GenieLab</a> on creative installations and gatherings. I spent 6 months learning the fundamentals of French</p>`,
];

/* Daily Tous les jours Trillium Consultation */
/* Daily Tous les jours FOMO Consultation */

/* no quarter */
/* genielab Arch Consult
ation */
/* we throw switches */
/* we throw switches 2 - Hon - V&A Dundee
 */

/* 2018 - hand eye society.  */

const timelineSlider = document.getElementById("timeline-slider");
const timelineText = document.getElementById("timeline-text");
const timelineLabels = document.querySelectorAll(".timelineslider-labels span");

timelineSlider.addEventListener("input", () => {
  setContentAndLabels(timelineText, timelines, timelineSlider, timelineLabels);
});

// Add click event listeners to the timeline labels
timelineLabels.forEach((label, index) => {
  label.addEventListener("click", () => {
    timelineSlider.value = index; // Update the slider value
    setContentAndLabels(
      timelineText,
      timelines,
      timelineSlider,
      timelineLabels
    );
  });
});

// Set default slider value to Medium
timelineSlider.value = 0;

// Initialize timeline content
setContentAndLabels(timelineText, timelines, timelineSlider, timelineLabels);
