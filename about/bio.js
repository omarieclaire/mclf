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
  `<p> <span class="year">In the delicious year of 2023:</span> ☀ I did an artist residency at the <a target="_blank" href="https://www.etc.cmu.edu/">Entertainment Technology Center</a> at Carnegie Mellon University with a field trip to NYC and created a game-poem with <a target="_blank" href="https://en.wikipedia.org/wiki/Heather_Kelley">Heather Kelley</a> and other collaborators that we showed at <a target="_blank" href="https://likelike.org/2023/03/01/grow-still/">LIKELIKE.</a> ☀ I co-founded <a target="_blank" href="https://torontogamesweek.com/">Toronto Games Week</a>, a celebration of playable arts and culture <a target="_blank" href="https://gameartsinternational.network/toronto-games-week/">organized with local games enthusiasts and community organizers</a> and <a target="_blank" href="https://nomediakings.org/">Jim Munroe</a> ☀ I co-organized <a target="_blank" href="http://gaiasymposium.net/">the GAIA Symposium</a>, an international think tank and network for the <a target="_blank" href="https://gameartsinternational.network/a-look-back-at-gaia-2023/">professional development of the game arts community:</a> aimed at curators, producers, event organizers and academics. ☀ I researched, wrote, and illustrated <a target="_blank" href="https://gameartsinternational.network/if-you-dont-like-the-game-change-the-rules/">If you don't like the game, change the rules</a>, 
  a surprisingly controversial comic about co-ops, unions, and work in the games industry (not everyone loves unions).
   ☀ I started a "Montreal Cultural Calendar" group and <a target="_blank" href="https://calendar.google.com/calendar/u/0?cid=MWY2MDllMGFjZjhhZWY3MGE0MzY4NDkyZDFmMWI3MzhmMjg3ZmI3OWIwNWY0YzgwMzVkYzdiNThmNmVjNGZmNUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t">calendar</a> and may have thereby magically built myself a community. ☀ I co-organized <a target="_blank" href="https://ccfest.rocks/virtual-cc-fest-june-18">CC Fest (Creative Code Fest)</a> with <a target="_blank" href="https://www.edsaber.info/">Saber Khan</a>, a free & friendly event for anyone curious about creative code with workshops on pixel art, music, color, arduino, data viz & more ☀ I made music! Mostly with voice, found sounds, guitar, synth and Frank's LinnDrum, and also with something that measures seismic vibrations. ☀ I learned how to use the laser-cutter (better) and embroidery machine at the local makerspace. ☀ I continue to serve on the <a target="_blank" href="https://www.instagram.com/easternblocmtl/">Eastern Bloc</a> programming commitee. ☀ I travelled to Mexico City for <a target="_blank" href="https://oasis.esne.es/">OASIS</a> <a target="_blank" href="https://www.cenart.gob.mx/">CENART in Ciudad de Mexico</a> (thanks to the Canadian Embassy and <a target="_blank" href="https://mexico.sae.edu/">SAE Institute Mexico</a>) and gave two artist talks about my work and research into work and play. ☀ I travelled to Halifax to host a <a target="_blank" href="http://eyelevel.art/post/change-rules-collaborative-zine-making-workshop-and-artist-panel-marie-leblanc-flanagan">collaborative zine-making workshop</a> and <a target="_blank" href="http://eyelevel.art/post/change-rules-collaborative-zine-making-workshop-and-artist-panel-marie-leblanc-flanagan">Artist Panel x Labour Rights</a> <a target="_blank" href="LINK">Eyelevel Gallery</a> , and to Lunenburg to scheme new collaborations with Cat Bluemke and Jonathan Carroll of <a target="_blank" href="http://www.catbluemke.com/spekwork.html">SpekWork Studio</a>. ☀ I paired with <a target="_blank" href="https://jvns.ca/">Julia Evans</a> to create <a target="_blank" href="https://wizardzines.com/zines/integers-floats/">How Integers and Floats Work</a>, where we explore the weird ways your computer does math, like 4294967295 + 1 = 0! And how 0.1 + 0.2 somehow is equals 0.30000000000000004! ☀ I had some big personal life changes and I didn't die. ☀ I grew peas and peppers but the squirrels ate all my tomatoes as always, just one bite and they toss them. ☀ We celebrated the 9th annual <a target="_blank" href="http://droneday.org/">Drone Day</a>. ☀ I drew hundreds of creatures. ☀ I adventured into a DIY citizen science retreat in Muskoka with <a target="_blank" href="https://leecyb.org/">Lee Cyborg</a>, <a target="_blank" href="https://hillarypredko.com/">Hillary Predko</a>, Nadine, Kamal, Julia, Dave, and company.   ☀ I travelled to Oakland, Point Arena, and Los Angeles where I made zines, animation flipbooks, and an eclipse whale game with <a target="_blank" href="http://cabbibo.com/">Cabbibo</a> and <a target="_blank" href="https://www.twitch.tv/pendletonward">Pen Ward</a>.
  <p>Year's not over yet!</p>`,
  //2022
  `<p> <span class="year">In the transformative year of 2022:</span></p>
<p>I did a residency at the Société des arts technologiques <a target="_blank" href="https://sat.qc.ca/en/metalab">Metalab</a> and made <a target="_blank" href="https://marieflanagan.com/come-with-me/">ComeWithMe</a>, a strange game exploring connection and the spaces between people (I wrote a blog post about getting <a target="_blank" href="https://marieflanagan.com/stuck/">stuck</a> along the way). ☀ I created <a target="_blank" href="https://tendercircuits.ca/home/indexx/">Tender Circuits</a> for <a target="_blank" href="https://digitalartsresourcecentre.ca/">DARC</a>, a web experience documenting the work of artists exploring the concept of connection and fungal intelligence through participating in AR app development.  ☀ I co-created <a target="_blank" href="https://www.instagram.com/p/Cd1LID2pTDi/">Song of the Soil</a> with Dirtpunk (Henry Driver, Rebecka Pettersson, Ashley Cho, and Sacha Holsnyder) about <a target="_blank" href="https://instagram.com/p/CdEIKmNpg6o/">microbes and fungus</a> and the beauty of <a target="_blank" href="https://twitter.com/omarieclaire/status/1521181177704558594">soil</a> for IndieCade's Climate Jam, and we won the Most Adventurous/Innovative award ☀ I worked with Leslie Ting to create <a target="_blank" href="http://summerworks.ca/show/what-brings-you-in/">What Brings You In</a>, an interactive online show with music, live narration, guest voices, and playful interactions.  ☀ I worked with You Are Swimming Here ☀ We celebrated the 8th annual drone day, and I organized the first ever <a target="_blank" href="LINK">Drone Jam</a>, where we made experimental games, toys, or playful things related to the idea of sustained tones. You can play the <a target="_blank" href="LINK">drone games here</a>. ☀ I worked with TruLuv on Design for #selfcare, incorporating rituals to deepen care, compassion, and connection. ☀ I worked with Long Winter, a music and arts monthly shoxwcase in Toronto featuring music, visual art, large scale installation, video, performance art, theatre, dance, new media and xR.  ☀ I co-organized 2022 Virtual CC Fest with Saber Khan, a virtual online creative coding event. ☀ I hosted a play session for artists few events for artists ​​exploring feelings around ai / ethics / being here now as we tried out new AI tools.  ☀ I co-organized with Ada X, and InterAccess Ctrl+Shift: Data Sovereignty & Community Action, conversations about listening, inquiring, contemplating, and consent-building in the age of digital giants. ☀ I hosted conversations with six artists in the X-Camera series to discuss their artistic practice. ☀ I organized a series of workshops called "playsessions" on making experimental games, including Concentric Fictions with Dhruv Jani, exploring magical realism, experimentation, and nonsense verse; Weird Theatre Games workshop with D. Squinkifer, a workshop about transforming emotionally challenging situations into one-of-a-kind awkward theatre games; Making It Work: Tools & Modes for Interactive Experiences, a workshop about designing playful interactive experiences with Jess Rowan Marcotte; and an online workshop exploring 3D creation in Blender and ZBrush with Anna Eyer. ☀ I created a series of sessions on funding games, including How to Finance Your Game without Going into Debt with Meagan Byrne, a workshop about financing games for small indie game studios. ☀ 
I co-hosted a series of conversations with Edith about Ideas</p>
<p>
We ran an edition of the imaginary residency?</p>
<p>Was this the year of the NUMANS workshop?</p>
<p>
I seem to have run something called Playful questions a casual open discussion series?</p>
<p>
I created a 70? page document documenting the COVE/COVOX project. </p>
<p>
I created a playful site exploring the idea of digital audience engagement.</p>
<p>
<p>I continue to serve on the <a target="_blank" href="https://www.instagram.com/easternblocmtl/">Eastern Bloc</a> programming commitee. </p>`,

  //2021
  `<p class="year">In the generative year of 2021:</p>
<p>I created Soft Sanctuary for Proyecto Bios in Argentina, a peaceful web space for slow connection, through interactive question prompt, 3D sculptures, and soft sounds with the support of the Canadian Embassy.</p>
<p>
<p>I co-organized the Game Arts International Assembly (GAIA) Online, a 9-session online conference event for 150+ game curators around the world, focused on interconnecting existing game arts organizations and nurturing new structures in emerging regions.</p>
<p>
I co-led the Tech Tech Tech project exploring alternatives to the Tech Giants Ada X Montreal, which included deep resaerch, interviews, a 4-part workshop with co-researchers exploring alternatives for office tools, social media, online gatherings, portfolios, performances & exhibitions. At the end I wrote and pubished two zines: Living in the time of tech giants and Finding our way.</p>
<p>
I made ​Mess With DNS with Julia Evans, an online resource to learn about Domain Name Systems through playful experiments.</p>
<p>I worked with Julia to create a zine about <a href="https://marieflanagan.com/how-dns-works">How DNS Works</a></p>
<p>
I worked with GMSM to create Mummer’s Journey, a wusical web experience. A virtual, 3D immersive version of the community of Woody Point acts as an online interactive advent calendar experience. </p>
<p>
We ran an edition of the Imaginary residency, A open-source collaborative artist residency. We also ran a special collaboration and made We dance with space owl.</p>
<p>
I worked with Leslie Ting to create <a target="_blank" href="https://www.leslieting.com/speculation">Speculation</a>, a theatrical concert with an immersive visual design based on the experience of vision loss. </p>
<p>
I made my very own social media, called "Friend News". I wrote and never shared "Dimensions of Online Spaces", because I couldn't find funding or space to finish developing the ideas.</p>
<p>
I ran the 8th edition of Drone Day, an annual celebration of drone, community, and experimental sounds.</p>
<p>
I organized a very unsucessful event called Parallel park play- A tiny gathering for us to play alongside each other.</p>

I hosted exploratory sessions called NoWorking, an online series of sessions dedicated to not working, and challenging ideas around labour.</p>
<p>
I contributed to the Processing Org 20th Anniversary Community Catalog Contributor, a community catalog to celebrate 20 years of Processing.</p>
<p>
I contributed to the Game Arts Curators Kit, a seventy page handbook for anyone interested in bringing a curatorial eye to the presentation of video games.</p>
<p>
I researched, wrote, and illustrated Isolation Nation with the support of GAIN, the CMF, and OC, a free resource for tips and tricks culled from 70 Canadian game creators.</p>
<p>
To the delight of my parents, I spoke on The Current (CBC) exploring creative ways for people to connect online.</p>
<p>
I did a special intensive residency/retreat with Cabbibo, Sean, Hayden, Cherrie, and Jack. I served as a mentor for Pixelles. I served on the Inter Arts Matrix: Birthplace of Hybrid Art board. I served on the Eastern Bloc programming committee. ☀ 
<p>I did an interview about drone sounds? 
2021: Buzz about drones - the aural kind - gets kids excited about learning twitter</p>
<p>
</p>`,
  //2020

  `<p>I showed Closer in Toronto. I organized an Experimental Gathering. Then the pandemic hit.  ☀ 
  I made Throne Room, a virtual bathroon for people to collaboratively graffiti and deface at A MAZE. Berlin, and for people to consider what they flush away. ☀ 

  I made Mood Ring with Emily, Rachel, and ? for Debaser. ☀ 

  I made Special Guest with a collaborative team of international artists, an experimental marketplace for booking playful guests to improve online meetings, and an invitation to imagine other ways of gathering. ☀ 

  I made Neighbourbot with Julia Evans for !!Con 2020. The idea was to make space for short spontaneous connections with neighbours at online events. ☀ 
  
  2020 Lungbutter | "Curtain" Music Video, Performer ☀ 

  2020 Sound Games (Web), Collection of playful connections to sound for Drone Day. Conceptual art in the form of tiny games inviting people to get intimate, playful, and curious about their relationship to sound. ☀ 

  2020 Collaborative Drawing with Isabella and Nomi.  ☀ 

  2020: Online Spaces - Event series exploring online spaces together. ☀ 
  
  2020 FemTech Online Hangs - with the feminist online org. ☀ 
  
  2020 Experimental Gatherings - Inspiration Show & Tell. ☀ 

  2020: Now & Next podcast. ☀ 

  2020 Softie Feelies (Online) Interdisciplinary Artist Residency ☀ 

  2020 A MAZE. Berlin (Online) Throne Room ☀ 
<p>433 with Leslie?</p>
  2020 Living Arts (Mississauga, Canada) ☀ 
  
  
  </p>`,
  //2019
  `<p>Lungbutter? New York: Artist in Residence at the <a target="_blank" href="https://gamecenter.nyu.edu/">NYU Game Center</a></p>`,
  //2018
  `<p>I built a one-month city-wide play experience for CAFKA in Kitchener-Waterloo. To Montreal to do an artist residency at <a target="_blank" href="https://tag.hexagram.ca/">Technoculture, Art and Games</a>. I consulted with <a target="_blank" href="http://www.dailytouslesjours.com/">Daily Tous Les Jours</a> and <a target="_blank" href="https://www.genielab.co/">GenieLab</a> on creative installations and gatherings. I spent 6 months learning the fundamentals of French</p>`,
];

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
    setContentAndLabels(timelineText, timelines, timelineSlider, timelineLabels);
  });
});

// Set default slider value to Medium
timelineSlider.value = 0;

// Initialize timeline content
setContentAndLabels(timelineText, timelines, timelineSlider, timelineLabels);
