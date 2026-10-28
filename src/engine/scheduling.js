function slots(start, end, minutes) {
  const parse=time=>{const match=/^(\d{2}):(\d{2}):(\d{2})$/.exec(String(time));if(!match)return null;const [,h,m,s]=match.map(Number);return h<24&&m<60&&s<60?h*3600+m*60+s:null;};
  const from=parse(start),to=parse(end);
  if(from===null||to===null||!Number.isInteger(minutes)||minutes<1||minutes>1440)throw new TypeError('A valid schedule time and positive slot length are required.');
  const result=[],step=minutes*60;
  for(let current=from;current+step<=to;current+=step){const h=Math.floor(current/3600),m=Math.floor(current%3600/60),s=current%60;result.push([h,m,s].map(n=>String(n).padStart(2,'0')).join(':'));}
  return result;
}
module.exports = { slots };
