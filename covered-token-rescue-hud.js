Hooks.on('updateOverlapHUD', async (token, hover)=>{
  if (!hover && !$(`#${token.id}-overlapping-div`).length) return $(`div.token-overlapping-div`).remove(); 
  //??:hover
  function doOverlap( l1, r1 ,  l2 ,  r2 ) {
    if (l1.x == r1.x || l1.y == r1.y || l2.x == r2.x || l2.y == r2.y)  return false;
    if (l1.x >= r2.x || l2.x >= r1.x) return false;
    if (r1.y <= l2.y || r2.y <= l1.y)  return false;
    return true;
  }
  //if (doesCover( topLeft1,  r1,  l2,  r2) )
  function doesCover( topLeft1, bottomRight1 ,  topLeft2 ,  bottomRight2 ) {
     return true;
    return false;
  }
  let c = token
  let topLeft1 = { x: c.x ,  y: c.y };
  let bottomRight1 = { x: c.x + c.w, y: c.y + c.h };
  let covered = [];
  for (let t of canvas.tokens.placeables.filter(t=>t.visible)) {
    if (t.id==c.id) continue;
      let topLeft2 = { x: t.x , y: t.y };
      let bottomRight2 = { x: t.x + t.w , y: t.y + t.w };
      if (topLeft1.x <= topLeft2.x && topLeft1.y <= topLeft2.y && bottomRight1.x >= bottomRight2.x && bottomRight1.y >= bottomRight2.y && t.owner) 
        covered.push(t);
  }
  

  
  if (!covered.length) return $(`div.token-overlapping-div`).remove(); 
  if (hover) $(`div.token-overlapping-div`).remove(); 
  
  let $div = $(`<div id="${token.id}-overlapping-div" class="token-overlapping-div ${token.id}" style="position: absolute; top: ${token.y+token.h}px; left: ${token.x}px; width: ${token.w}px; display:block;" data-tokenid="${token.id}">
  <style>
  .token-overlapping-div {
    font-size: ${canvas.grid.size/6}px;
    pointer-events: all;
  }
  .token-overlapping-div > center.overlapping {
    width: max-content; transform: translate(-50%, 0%); 
    top: -${canvas.grid.size/3}px;
    font-size: ${canvas.grid.size/4}px;
    position: absolute; white-space:nowrap;
    left: ${token.w/2}px;
    border: 1px solid rgba(0,0,0,0);
  } 
  .token-overlapping-div > center.overlapping > a {
    margin: 2px;
  } 
  .token-overlapping-div > center.overlapping > a > img {
    border: 1px solid rgba(0,0,0,0);
  } 
  </style></div>`);
  $div.append($(
    covered.reduce((a,t)=>{
    if (t.document.texture.src.includes('.webm')) a+=`<a class="token" data-id="${t.id}" title="${t.name}" ><video width="${canvas.grid.size/3}" height="${canvas.grid.size/3}" ${t.controlled?'style="border: 1px solid orange;"':''}><source src="${t.document.texture.src}" type="video/webm"> </video></a>`
    else a+=`<a class="token" data-id="${t.id}" title="${t.name}" ><img src="${t.document.texture.src}" width="${canvas.grid.size/3}" height="${canvas.grid.size/3}" ${t.controlled?'style="border: 1px solid orange;"':''}></a>`
    return a;
  },`<center class="overlapping">`) +`</center>`));
  $div.find('a.token').click(function(e){
    let t = canvas.tokens.get(this.dataset.id)
    t.control({releaseOthers:!e.shiftKey})
    
    $(this).parent().find('a').each(function(){
      let t = canvas.tokens.get($(this).data().id)
      if (!t.isOwner) return; 
      if (t.controlled) $(this).find('img').css('border', '1px solid orange')
      else $(this).find('img').css('border', '1px solid rgba(0,0,0,0)')
    });
  })
  .contextmenu(function(e){
    let t = canvas.tokens.get(this.dataset.id)
    if (!t.isOwner) return; 
    if ( canvas.tokens.hud.object === t) return canvas.tokens.hud.clear();
      else {
        t.control({releaseOthers: !e.shiftKey});
        return canvas.tokens.hud.bind(t);
      }
  })
  .mouseover(function(e){
    let tok = canvas.tokens?.get($(this).data().id);
    let $div = $(`<div id="${tok.id}-marker" class="token-marker ${tok.id}" style="position: absolute; top: ${tok.y-2}px; left: ${tok.x-2}px; display:block;
    width: ${tok.w+4}px; height: ${tok.h+4}px;  border: 2px solid red; border-radius: 3px;" data-tokenid="${tok.id}"></div>`);
      $('#hud').append($div);
  })
  .mouseout(function(e) {
    $('#hud').find('div.token-marker').remove();
  });
  $div.find('center').mouseleave(function(){$(this).remove();})
  $(`#hud`).append($div);
})

Hooks.on('updateToken', (token, updates)=> {
  if (!updates.x && !updates.y) return;
  Hooks.callAll('updateOverlapHUD', token, token.hover)
  $('#hud').find('div.token-marker').remove();
})

Hooks.on('hoverToken', (token, hover)=> {
  if ($('#token-hud').is(":visible")) return;
  Hooks.callAll('updateOverlapHUD', token, hover)
})

Hooks.on('renderTokenHUD', (app, html, hudData)=>{
  $(`div.token-overlapping-div`).remove(); 
  $('#hud').find('div.token-marker').remove();
});