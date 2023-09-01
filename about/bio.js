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
         <a href="https://polarismusicprize.ca/">Polaris Prize</a> Juror.</p>`
  ];
  
 
const bioSlider = document.getElementById("bio-slider");
const bioText = document.getElementById("bio-text");
const sliderLabels = document.querySelectorAll(".slider-labels span");

bioText.innerHTML = bios[2]; // Set default bio to Medium

bioSlider.addEventListener("input", () => {
  const bioIndex = parseInt(bioSlider.value);
  bioText.innerHTML = bios[bioIndex];
});

// Set default slider value to Medium
bioSlider.value = 2;

// Highlight current label based on slider value
bioSlider.addEventListener("input", () => {
  sliderLabels.forEach((label, index) => {
    label.classList.toggle("active", index === parseInt(bioSlider.value));
  });
});

// Update slider position and bio when labels are clicked
sliderLabels.forEach((label, index) => {
  label.addEventListener("click", () => {
    bioSlider.value = index;
    bioText.innerHTML = bios[index];
  });
});