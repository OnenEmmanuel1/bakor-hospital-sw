const crypto=require('crypto');
module.exports=function csrf(req,res,next){
  if(!req.session.csrfToken)req.session.csrfToken=crypto.randomBytes(32).toString('hex');
  req.csrfToken=()=>req.session.csrfToken;
  if(['GET','HEAD','OPTIONS'].includes(req.method))return next();
  const supplied=req.get('x-csrf-token')||req.body?._csrf||'';
  const expected=req.session.csrfToken;
  const a=Buffer.from(String(supplied)),b=Buffer.from(String(expected));
  if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(403).send('Invalid or missing CSRF token.');
  next();
};
