const permissions = {
  patient: ['patient:self','appointment:self','history:self','export:self'], receptionist: ['patient:register','patient:demographics','appointment:manage','queue:manage'],
  doctor: ['schedule:self','queue:read','consultation:write','lab:order','prescription:write','result:released'], lab_technician: ['lab:work'], pharmacist: ['pharmacy:work'], cashier: ['billing:work'], admin: ['users:manage','catalog:manage','reports:read','audit:read','breakglass:review','settings:manage']
};
const landing = { patient:'/patient', receptionist:'/reception', doctor:'/doctor', lab_technician:'/lab', pharmacist:'/pharmacy', cashier:'/cashier', admin:'/admin' };
module.exports = { permissions, landing, can: (role, permission) => !!permissions[role]?.includes(permission) };
