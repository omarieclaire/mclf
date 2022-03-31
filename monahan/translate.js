let lang = "EN"
localStorage['lang'] = "EN"; 
let langLabel = document.querySelector('#langToggle')
let langToggle = document.getElementById("langToggle").addEventListener("click", toggleLanguage);

const strings = [
     {id: 'aboutNav', fr: 'Page d\'accueil', en: 'About'},
     {id: 'accessiblityNav', fr: 'Accessibilité', en: 'Accessibility'},
     {id: 'aboutNav', fr: 'Page d\'accueil', en: 'About'},
     {id: 'homeH1', fr: 'Une promenade sonore pour les oreilles curieuses', en: 'A sound walk for curious ears'},
     {id: 'homeTxt', fr: 'Rejoignez-nous pour une promenade audio personnalisée avec les sons des zones humides de Monahan.', en: 'Join us for a custom audio walk with the sounds of the Monahan wetlands'}
    //  {id: 'beginBtn', fr: 'Commencer', en: 'Begin'},
    //  {id: 'XXX', fr: 'XXX', en: 'XXX'},
    //  {id: 'XXX', fr: 'XXX', en: 'XXX'},
    //  {id: 'XXX', fr: 'XXX', en: 'XXX'},
    //  {id: 'XXX', fr: 'XXX', en: 'XXX'},
    //  {id: 'XXX', fr: 'XXX', en: 'XXX'},
    //  {id: 'XXX', fr: 'XXX', en: 'XXX'},
    //  {id: 'XXX', fr: 'XXX', en: 'XXX'},
    //  {id: 'XXX', fr: 'XXX', en: 'XXX'},
    //  {id: 'XXX', fr: 'XXX', en: 'XXX'},
    //  {id: 'XXX', fr: 'XXX', en: 'XXX'}
];

const buttonStrings = [
    {id: 'beginBtn', fr: 'Commencer', en: 'Begin'}
];

function changeEachLangDiv(currLang){
    function changeEachString (string) {
        if (currLang == "FR") {
            document.getElementById(string.id).innerHTML = string.fr;
        } else {
            document.getElementById(string.id).innerHTML = string.en;
        }
    }

    function changeEachBtnString (string) {
        if (currLang == "FR") {
            document.querySelector('#' + string.id).innerHTML = string.fr;
        } else {
            document.querySelector('#' + string.id).innerHTML = string.en;
        }
    }

    strings.forEach(changeEachString);
    buttonStrings.forEach(changeEachBtnString);

}

function toggleLanguage() {
  if(lang == "EN"){
      langLabel.innerHTML = 'EN';
      lang = "FR";
  } else {
      langLabel.innerHTML = 'FR';
      lang  = "EN"
  }
  localStorage['lang'] = lang;
  changeEachLangDiv(lang);
}

// document.getElementById("aboutNav").innerHTML = "Page d'accueil";
// document.getElementById("accessiblityNav").innerHTML = "Accessilbité";
