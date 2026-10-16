(() => {
  const host=document.getElementById('characterModel');
  if(!host || !window.THREE) return;
  const T=window.THREE;
  host.querySelectorAll('.model-cape,.model-head,.model-neck,.model-body,.model-arm,.model-leg,.model-weapon').forEach(e=>e.style.display='none');
  const renderer=new T.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(host.clientWidth||320,host.clientHeight||360,false);
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','Rotatable 3D fantasy character preview');
  host.appendChild(renderer.domElement);
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(35,(host.clientWidth||320)/(host.clientHeight||360),.1,100);
  camera.position.set(0,1.45,7.5);
  scene.add(new T.HemisphereLight(0xc8ddff,0x25162e,2));
  const keyLight=new T.DirectionalLight(0xffdf9a,3);keyLight.position.set(3,5,5);scene.add(keyLight);
  const rim=new T.PointLight(0x8f86ff,18);rim.position.set(-3,2,-2);scene.add(rim);
  const hero=new T.Group();scene.add(hero);
  const mat=(color,metal=0,rough=.55)=>new T.MeshStandardMaterial({color,metalness:metal,roughness:rough});
  let skin=mat('#d8a078'),hair=mat('#352b45'),cloth=mat('#263f79',.2),trim=mat('#e9c477',.65),weaponMat=mat('#b8d7ff',.7,.25);
  const sphere=(x,y,z,sx,sy,sz,m)=>{const o=new T.Mesh(new T.SphereGeometry(1,24,18),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);hero.add(o);return o;};
  const cyl=(x,y,z,rt,rb,h,m,rot=0)=>{const o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,12),m);o.position.set(x,y,z);o.rotation.z=rot;hero.add(o);return o;};
  function build(){
    while(hero.children.length)hero.remove(hero.children[0]);
    const race=document.getElementById('raceSelect')?.value||'Human';
    const cls=document.getElementById('classSelect')?.value||document.getElementById('playerClass')?.value||'Swordsman';
    const raceColors={Human:'#d8a078',Elf:'#c9a27d',Demon:'#a85e6c',Dragonkin:'#b6a36e',Dwarf:'#b77f5d'};
    skin=mat(raceColors[race]||'#d8a078'); hair=mat(document.getElementById('hairColor')?.value||'#352b45');
    const outfits={Mage:'#453078',Assassin:'#22283b',Summoner:'#32675b',Necromancer:'#352542',Swordsman:'#263f79'};
    cloth=mat(outfits[cls]||'#263f79',.18); trim=mat('#e9c477',.65); weaponMat=mat('#b8d7ff',.7,.25);
    sphere(0,-.8,0,.24,.52,.24,cloth);sphere(-.17,-1.1,0,.12,.42,.14,cloth);sphere(.17,-1.1,0,.12,.42,.14,cloth);
    sphere(0,.05,0,.48,.62,.28,cloth);sphere(0,.73,0,.3,.34,.29,skin);
    sphere(0,.97,-.02,.31,.18,.3,hair);
    sphere(-.12,.75,.25,.035,.035,.025,mat('#1b1b26'));sphere(.12,.75,.25,.035,.035,.025,mat('#1b1b26'));
    sphere(0,.62,.26,.1,.025,.02,trim);
    cyl(-.53,.03,0,.12,.1,.72,skin,-.25);cyl(.53,.03,0,.12,.1,.72,skin,.25);
    sphere(-.62,-.32,.03,.13,.13,.13,skin);sphere(.62,-.32,.03,.13,.13,.13,skin);
    sphere(0,.12,.29,.24,.08,.04,trim);
    // shoulders, belt and boots add depth to the miniature model
    sphere(-.39,.35,0,.2,.18,.23,trim);sphere(.39,.35,0,.2,.18,.23,trim);
    sphere(0,-.55,.03,.31,.07,.3,trim);
    sphere(-.17,-1.45,.12,.16,.12,.25,mat('#171b2b'));sphere(.17,-1.45,.12,.16,.12,.25,mat('#171b2b'));
    if(race==='Elf'){cyl(-.28,.78,0,.01,.11,.25,skin,-.8);cyl(.28,.78,0,.11,.01,.25,skin,.8);}
    if(race==='Demon'||race==='Dragonkin'){cyl(-.19,1.02,0,.01,.09,.28,trim,-.4);cyl(.19,1.02,0,.09,.01,.28,trim,.4);}
    if(cls==='Mage'||cls==='Summoner'||cls==='Necromancer'){cyl(.76,-.05,-.03,.035,.035,1.55,trim);sphere(.76,.78,-.03,.15,.15,.15,weaponMat);}
    else {cyl(.78,-.05,.02,.035,.035,1.1,trim,-.25);sphere(.65,.43,.03,.07,.07,.07,weaponMat);}
  }
  build();
  const obs=new MutationObserver(()=>build());['raceSelect','classSelect','playerClass','hairColor'].forEach(id=>{const e=document.getElementById(id);if(e) e.addEventListener('change',build);});
  let down=false,lastX=0;renderer.domElement.addEventListener('pointerdown',e=>{down=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointermove',e=>{if(down){hero.rotation.y+=(e.clientX-lastX)*.012;lastX=e.clientX;}});renderer.domElement.addEventListener('pointerup',()=>down=false);renderer.domElement.addEventListener('pointercancel',()=>down=false);
  function resize(){const w=host.clientWidth||320,h=host.clientHeight||360;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(host);
  (function animate(){requestAnimationFrame(animate);if(!down)hero.rotation.y+=.002;renderer.render(scene,camera);})();
})();
