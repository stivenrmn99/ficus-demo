export const VERSION=1;
export function day(offset=0){const date=new Date();date.setDate(date.getDate()+offset);return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function seed(){
 return {version:VERSION,role:'visitante',brand:{name:'Ficus',tagline:'Hotel & Gym',color:'forest'},
 rooms:[
 {id:1,number:'101',name:'Suite Jardín',price:290,capacity:2,condition:'ready',description:'Luz natural, texturas cálidas y una cama king para descansar sin prisa.',image:'photo-1611892440504-42a792e24d32'},
 {id:2,number:'102',name:'Habitación Serena',price:190,capacity:2,condition:'ready',description:'Un refugio íntimo. Todo lo que necesitas, con espacio para desconectar.',image:'photo-1618773928121-c32242e63f39'},
 {id:3,number:'201',name:'Suite Familiar',price:350,capacity:4,condition:'ready',description:'Momentos compartidos, dos camas y una zona de estar para sentirse en casa.',image:'photo-1590490360182-c33d57733427'}],
 plans:[{id:1,name:'Essential',price:99,days:30,description:'Tu primer paso. Acceso al gimnasio y entrenamiento libre.'},{id:2,name:'Club Plus',price:149,days:30,description:'Un ritmo propio. Gimnasio, clases y seguimiento de tu coach.'},{id:3,name:'Annual Club',price:1290,days:365,description:'Un año para ti. Constancia y bienestar a largo plazo.'}],
 clients:[{id:4,name:'Valeria Flores',document:'00000001'},{id:6,name:'Gabriel Luna',document:'00000002'},{id:7,name:'Camila Vega',document:'00000003'}],
 staff:[{name:'Sofía Ramos',role:'Administradora'},{name:'Lucía Mendoza',role:'Recepcionista'},{name:'Ana Torres',role:'Coach'},{name:'Diego Rojas',role:'Coach'}],
 coaches:[{id:3,name:'Ana Torres',specialty:'Fuerza y movilidad',bio:'Paso a paso, cuidando la técnica. Tu entrenamiento se adapta a ti.'},{id:5,name:'Diego Rojas',specialty:'Acondicionamiento físico',bio:'Movimiento, constancia y objetivos a tu ritmo.'}],
 bookings:[{id:1,user_id:4,room_id:1,check_in:day(3),check_out:day(6),guests:2,total:870,status:'confirmed'},{id:2,user_id:6,room_id:2,check_in:day(),check_out:day(2),guests:1,total:380,status:'checked_in'}],
 memberships:[{id:1,user_id:4,plan_id:2,start:day(-10),end:day(19),status:'active',total:149},{id:2,user_id:6,plan_id:1,start:day(-5),end:day(24),status:'active',total:99}],
 attendance:[{id:1,user_id:4,date:day(-1),time:'08:30'},{id:2,user_id:4,date:day(-3),time:'08:45'},{id:3,user_id:4,date:day(-5),time:'09:00'},{id:4,user_id:6,date:day(),time:'10:00'}],
 routines:[{user_id:4,coach_id:3,title:'Tu semana en movimiento',goal:'Técnica, fuerza y movilidad. Un ejemplo para explorar el seguimiento.',notes:'Rutina ficticia de demostración; no es una prescripción de entrenamiento.',exercises:[{day:'Lunes',name:'Sentadilla a banco',sets:3,reps:'10 repeticiones',rest:'60 segundos'},{day:'Lunes',name:'Remo con banda',sets:3,reps:'12 repeticiones',rest:'60 segundos'},{day:'Miércoles',name:'Movilidad de cadera',sets:2,reps:'5 minutos',rest:'30 segundos'},{day:'Viernes',name:'Puente de glúteos',sets:3,reps:'12 repeticiones',rest:'45 segundos'}]},{user_id:6,coach_id:5,title:'Movimiento consciente',goal:'Ejemplo de acondicionamiento.',notes:'Ejemplo ficticio.',exercises:[{day:'Martes',name:'Caminata suave',sets:1,reps:'15 minutos',rest:'A tu ritmo'}]}],
 billing:[]
 };
}
export const nextId=items=>Math.max(0,...items.map(i=>i.id))+1;
export function reserve(state,input){
 const room=state.rooms.find(r=>r.id===Number(input.room_id));
 if(!room||room.condition!=='ready')throw Error('La habitación no está lista.');
 if(!state.clients.some(c=>c.id===Number(input.user_id)))throw Error('Selecciona un cliente de la demo.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.check_in)||!/^\d{4}-\d{2}-\d{2}$/.test(input.check_out))throw Error('Selecciona fechas válidas.');
 const start=new Date(input.check_in+'T12:00:00Z'),end=new Date(input.check_out+'T12:00:00Z');
 if(!Number.isFinite(+start)||!Number.isFinite(+end)||start.toISOString().slice(0,10)!==input.check_in||end.toISOString().slice(0,10)!==input.check_out)throw Error('Selecciona fechas válidas.');
 const nights=(end-start)/86400000,guests=Number(input.guests);
 if(input.check_in<day()||nights<=0||nights>90)throw Error('Elige una estancia futura de 1 a 90 noches.');
 if(!Number.isInteger(guests)||guests<1||guests>room.capacity)throw Error('Revisa la capacidad de la habitación.');
 if(state.bookings.some(b=>b.room_id===room.id&&(['confirmed','pending','checked_in'].includes(b.status))&&(b.status==='checked_in'||(b.check_in<input.check_out&&b.check_out>input.check_in))))throw Error('La habitación está ocupada o reservada para esas fechas.');
 const booking={id:nextId(state.bookings),user_id:Number(input.user_id),room_id:room.id,check_in:input.check_in,check_out:input.check_out,guests,total:nights*room.price,status:'confirmed'};
 state.bookings.push(booking);return booking;
}
export function changeRoom(state,id,condition){
 if(!['ready','cleaning','maintenance'].includes(condition))throw Error('Estado inválido.');
 const room=state.rooms.find(r=>r.id===Number(id));if(!room)throw Error('Habitación no encontrada.');
 if(state.bookings.some(b=>b.room_id===room.id&&b.status==='checked_in'))throw Error('Registra la salida antes de cambiar el estado.');
 room.condition=condition;
}
export function stay(state,id,action){
 const booking=state.bookings.find(b=>b.id===Number(id));if(!booking)throw Error('Reserva no encontrada.');
 const room=state.rooms.find(r=>r.id===booking.room_id);
 if(action==='check-out'){if(booking.status!=='checked_in')throw Error('La reserva no tiene entrada registrada.');booking.status='completed';room.condition='cleaning';}
 else if(action==='check-in'){
  if(booking.status!=='confirmed'||booking.check_in>day()||booking.check_out<=day()||room.condition!=='ready'||state.bookings.some(b=>b.room_id===room.id&&b.status==='checked_in'))throw Error('La entrada requiere una reserva de hoy y una habitación lista.');
  booking.status='checked_in';
 }else{throw Error('Operación inválida.');}
}
export function recordAttendance(state,userId){
 const id=Number(userId);if(!state.memberships.some(m=>m.user_id===id&&m.status==='active'&&m.start<=day()&&m.end>=day()))throw Error('El socio no tiene un plan vigente.');
 state.attendance.unshift({id:nextId(state.attendance),user_id:id,date:day(),time:new Intl.DateTimeFormat('es-PE',{timeZone:'America/Lima',hour:'2-digit',minute:'2-digit'}).format(new Date())});
}
export function saveRoutine(state,userId,input){
 const routine=state.routines.find(r=>r.user_id===Number(userId));
 if(!routine||(state.role!=='admin'&&!(state.role==='coach'&&routine.coach_id===3)))throw Error('Selecciona una rutina de tus clientes asignados.');
 if(!input.title.trim()||!input.exercises.length||input.exercises.length>50)throw Error('Completa el nombre y entre 1 y 50 ejercicios.');
 if(input.exercises.some(e=>!e.day.trim()||!e.name.trim()||!Number.isInteger(e.sets)||e.sets<1||e.sets>30||!e.reps.trim()))throw Error('Revisa los días, ejercicios, series y repeticiones.');
 Object.assign(routine,{title:input.title.trim(),goal:input.goal,notes:input.notes,exercises:input.exercises});
}
