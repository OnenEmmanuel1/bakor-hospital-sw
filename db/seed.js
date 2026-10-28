require('dotenv').config();
const fs=require('node:fs');
const path=require('node:path');
const mysql=require('mysql2/promise');
const bcrypt=require('bcrypt'),db=require('../src/config/db');
const accounts=[['admin@bakorhospital.test','admin','System','Administrator'],['doctor1@bakorhospital.test','doctor','Amina','Kalu'],['doctor2@bakorhospital.test','doctor','Tunde','Bassey'],['doctor3@bakorhospital.test','doctor','Miriam','Etim'],['reception1@bakorhospital.test','receptionist','Ada','Okon'],['cashier1@bakorhospital.test','cashier','Eyo','Duke'],['lab1@bakorhospital.test','lab_technician','Ima','Ekpo'],['pharmacist1@bakorhospital.test','pharmacist','Uduak','Essien'],['patient1@bakorhospital.test','patient','Fictional','One'],['patient2@bakorhospital.test','patient','Fictional','Two'],['patient3@bakorhospital.test','patient','Fictional','Three']];
async function initializeDatabase(){
  const name=process.env.DB_NAME;
  if(!name||!/^[_a-zA-Z0-9]+$/.test(name))throw new Error('DB_NAME must contain only letters, numbers, or underscores.');
  const bootstrap=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,charset:'utf8mb4'});
  try{await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);}finally{await bootstrap.end();}
  const schema=fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8');
  for(const statement of schema.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
}
async function main(){await initializeDatabase();const hash=await bcrypt.hash('password123',12);for(const [email,role,first,last] of accounts){await db.execute('INSERT INTO users(email,password_hash,role) VALUES(?,?,?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash),role=VALUES(role),failed_logins=0,locked_until=NULL,must_change_password=FALSE',[email,hash,role]);const [[u]]=await db.execute('SELECT id FROM users WHERE email=?',[email]);if(role!=='patient')await db.execute('INSERT INTO staff_profiles(user_id,first_name,last_name) VALUES(?,?,?) ON DUPLICATE KEY UPDATE first_name=VALUES(first_name),last_name=VALUES(last_name)',[u.id,first,last]);}
for(const name of ['General Medicine','Paediatrics','Obstetrics and Gynaecology'])await db.execute('INSERT IGNORE INTO specialties(name,consultation_fee) VALUES(?,?)',[name,5000]);
for(const [email] of accounts.filter(a=>a[1]==='doctor')){const [[u]]=await db.execute('SELECT id FROM users WHERE email=?',[email]);await db.execute('INSERT IGNORE INTO doctor_schedules(doctor_id,weekday,start_time,end_time,slot_minutes) VALUES(?,1,\'09:00\',\'13:00\',30)',[u.id]);}
for(let i=1;i<=25;i++){const phone=`0800000${String(i).padStart(4,'0')}`,email=i<=3?`patient${i}@bakorhospital.test`:null;let userId=null;if(email){const [[u]]=await db.execute('SELECT id FROM users WHERE email=?',[email]);userId=u.id;}await db.execute('INSERT IGNORE INTO patients(patient_no,user_id,first_name,last_name,sex,date_of_birth,phone,email,status) VALUES(?,?,?,?,?,?,?,?,\'active\')',[`BKH-2026-${String(i).padStart(5,'0')}`,userId,['Fictional','Sample','Demo'][i%3],`Patient${String(i).padStart(2,'0')}`,['female','male','other'][i%3],`199${i%10}-0${i%9+1}-1${i%9}`,phone,email]);}
for(const name of ['Complete blood count','Blood glucose','Urinalysis'])await db.execute('INSERT IGNORE INTO lab_tests(name,sample_type,price,unit,reference_low,reference_high) VALUES(?,?,?,?,?,?)',[name,'blood',1500,'unit',4,12]);
for(const [name,generic] of [['Paracetamol','paracetamol'],['Amoxicillin','amoxicillin'],['Cetirizine','cetirizine']])await db.execute('INSERT IGNORE INTO drugs(name,generic_name,form,strength,unit_price,reorder_level) VALUES(?,?,\'tablet\',\'500 mg\',100,20)',[name,generic]);
console.log('Seed complete. Every demo password is password123.');}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.end());
