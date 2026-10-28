const menuToggle=document.querySelector('.bkh-menu-toggle');
const sidebar=document.getElementById('workspace-sidebar');
if(menuToggle&&sidebar){
  menuToggle.addEventListener('click',()=>{
    const isOpen=sidebar.classList.toggle('bkh-sidebar-open');
    document.body.classList.toggle('bkh-nav-open',isOpen);
    menuToggle.setAttribute('aria-expanded',String(isOpen));
    menuToggle.setAttribute('aria-label',isOpen?'Close navigation':'Open navigation');
  });
  sidebar.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    sidebar.classList.remove('bkh-sidebar-open');
    document.body.classList.remove('bkh-nav-open');
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label','Open navigation');
  }));
  document.addEventListener('click',event=>{
    if(!document.body.classList.contains('bkh-nav-open')||event.target!==document.body)return;
    sidebar.classList.remove('bkh-sidebar-open');
    document.body.classList.remove('bkh-nav-open');
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label','Open navigation');
  });
}

document.querySelectorAll('[data-slot-booking="true"]').forEach(form=>{
  const doctor=form.elements.namedItem('doctorId');
  const date=form.elements.namedItem('date');
  const time=form.querySelector('[data-slot-time]');
  const fallback=form.querySelector('[data-slot-time-fallback]');
  const status=form.querySelector('[data-slot-time-status]');
  if(!doctor||!date||!time||!fallback)return;
  let requestNumber=0;
  const update=async()=>{
    const request=++requestNumber;
    fallback.value='';
    fallback.hidden=false;
    fallback.disabled=false;
    fallback.name='time';
    time.hidden=true;
    time.disabled=true;
    time.removeAttribute('name');
    if(status)status.textContent='';
    if(!doctor.value||!date.value){if(status)status.textContent='Choose a doctor and date to load available appointment times.';return;}
    if(status)status.textContent='Loading available appointment times…';
    try{
      const response=await fetch(`/api/slots?doctor=${encodeURIComponent(doctor.value)}&date=${encodeURIComponent(date.value)}`,{headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('Availability could not be loaded.');
      const {slots}=await response.json();
      if(request!==requestNumber)return;
      time.replaceChildren(new Option(slots.length?'Choose an available time':'No times available',''));
      slots.forEach(slot=>time.add(new Option(slot.slice(0,5),slot)));
      if(slots.length){
        fallback.hidden=true;
        fallback.disabled=true;
        fallback.removeAttribute('name');
        time.name='time';
        time.disabled=false;
        time.hidden=false;
        if(status)status.textContent='Select one of the available appointment times.';
      }else if(status)status.textContent='No appointment slots are listed for this doctor on that date. You can enter a time; the server will confirm whether it is bookable.';
    }catch{
      if(request!==requestNumber)return;
      if(status)status.textContent='Available slots could not be loaded. Enter a time and the server will check availability.';
    }
  };
  doctor.addEventListener('change',()=>{time.value='';update();});
  date.addEventListener('change',()=>{time.value='';update();});
  if(doctor.value&&date.value)update();
});
