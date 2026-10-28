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
  if(!doctor||!date||!time)return;
  let requestNumber=0;
  const update=async()=>{
    const request=++requestNumber;
    time.replaceChildren(new Option('Loading available times…',''));
    if(!doctor.value||!date.value){time.replaceChildren(new Option('Choose doctor and date first',''));return;}
    try{
      const response=await fetch(`/api/slots?doctor=${encodeURIComponent(doctor.value)}&date=${encodeURIComponent(date.value)}`,{headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('Availability could not be loaded.');
      const {slots}=await response.json();
      if(request!==requestNumber)return;
      time.replaceChildren(new Option(slots.length?'Choose an available time':'No times available',''));
      slots.forEach(slot=>time.add(new Option(slot.slice(0,5),slot)));
    }catch{
      if(request!==requestNumber)return;
      time.replaceChildren(new Option('Availability could not be loaded',''));
    }
  };
  doctor.addEventListener('change',()=>{time.value='';update();});
  date.addEventListener('change',()=>{time.value='';update();});
});
