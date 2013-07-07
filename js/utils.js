function getOpt(opt){
  return (window.localStorage != null && window.localStorage.getItem(opt) != null) ? window.localStorage.getItem(opt) : "true";
}
