const html = `
<style>
  body {
    margin: 0;
    color: white;
    font-size: small;
  }
  .extendedh {
    width: 100%;
  }
  .extendedv {
    height: 100%;
  }
  #wrapper {
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.6);
    box-sizing: border-box;
  }
  .extendedh body,
  .extendedh #wrapper {
    width: 100%;
  }
  .extendedv body,
  .extendedv #wrapper {
    height: 100%;
  }
  #main_wrapper {
    background: #000;
    border-radius: 10px 10px 0 0;
    padding: 15px 17px;
  }
  #main_wrapper.is-hidden {
    display: none;
  }
  .main_title {
    font-size: 16px;
  }
  .main_description {
    margin: 10px 0 0;
    font-size: 12px;
  }
  .layer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 0;
    cursor: pointer;
    border-top: 1px solid rgba(255, 255, 255, 0.6);
    transition: all 400ms;
  }
  .layer:hover {
    background-color: #fff;
    color: #000;
  }
  #title_list {
    border-radius: 0 0 10px 10px;
    background-color: rgba(0, 0, 0, 0.6);
  }
  #title_list.is-hidden {
    display: none;
  }
  #story_wrapper {
    display: flex;
    justify-content: space-between;
  }
  #story_wrapper #prev, #story_wrapper #next {
    position: relative;
    border: none;
    background: none;
    appearance: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    background-color: rgba(255, 255, 255, 0.05);
    transition: all 400ms;
  }
  #story_wrapper #prev:hover, #story_wrapper #next:hover {
    background-color: rgba(255, 255, 255, 0.35);
  }
  #story_wrapper #prev:after, #story_wrapper #next:after {
    content: '';
    position: absolute;
    top: 50%;
    width: 7px;
    height: 7px;
    transform: translateY(-50%) rotate(-45deg);
    transform-origin: center;
  }
  #story_wrapper #prev:after {
    border-top: 1px solid #fff;
    border-left: 1px solid #fff;
    left: 8px;
  }
  #story_wrapper #next:after {
    border-bottom: 1px solid #fff;
    border-right: 1px solid #fff;
    right: 8px;
  }
  #story_wrapper.is-hidden {
    display: none;
  }
  #story_title, #marker_title, #story_num {
    margin: 0;
  }
  #story {
    padding: 10px;
    width: 100%;
  }
  #story_info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  #story_title, #story_num {
    font-size: 12px;
  }
  #marker_title {
    font-size: 14px;
  }
</style>
<div id="wrapper">
  <div id="main_wrapper"></div>
  <div id="title_list"></div>
  <div id="story_wrapper" class="is-hidden">
    <button id="prev"></button>
    <div id="story">
      <h3 id="marker_title"></h3>
      <div id="story_info">
        <h2 id="story_title"></h2>
        <p id="story_num"></p>
      </div>
    </div>
    <button id="next"></button>
  </div>
</div>
<script>
  let reearth;
  let index = 0;
  let selectedMenuIndex = -1;
  let origin;
  let layers = [];
  
  const $mainWrap = document.getElementById('main_wrapper')
  const $titleList = document.getElementById('title_list')
  const $storyWrap = document.getElementById('story_wrapper')
  const $storyTitle = document.getElementById('story_title')
  const $storyNum = document.getElementById('story_num')

  const cb = (e) => {
    reearth = e.source.reearth;
    property = e.data.property;
    
    if (property && property.default && property.default.title) {
      const $title = document.createElement('div')
      $title.classList.add('main_title')
      $title.innerText = property.default.title
      $mainWrap.appendChild($title)
    }
    if (property && property.default && property.default.description) {
      const $description = document.createElement('div')
      $description.classList.add('main_description')
      $description.innerText = property.default.description
      $mainWrap.appendChild($description)
    }

    // この部分の必要性は今ひとつよく分からない
    if (property && property.extended) {
      if (property.extended.horizontally) { document.documentElement.classList.add('extendedh');
      } else {  document.documentElement.classList.remove('extendedh');
      } if (property.extended.vertically) { document.documentElement.classList.add('extendedv');
      } else { document.documentElement.classList.remove('extendedv'); }
    }

    layers = e.data.layers
    layers.map((layer, index) => {
      const $layer = document.createElement('div')
      $layer.classList.add('layer')
      $layer.innerText = layer.title
      $layer.dataset.id = index
      $layer.addEventListener('click', selectMenu)
      $titleList.appendChild($layer)
    })
    origin = e.data.origin
    
    if (property && property.default && property.default.autostart) {
      selectedMenuIndex = 0
      showLayer()
    }
  };
  
  const selectMenu = (e) => {
    selectedMenuIndex = e.target.dataset.id
    showLayer()
  }

  addEventListener('message', (e) => {
    if (e.source !== parent) return;
    cb(e);
  });
  
  const showLayer = () => {
    $mainWrap.classList.add('is-hidden')
    $titleList.classList.add('is-hidden')
    $storyWrap.classList.remove('is-hidden')
    $storyTitle.textContent = layers[selectedMenuIndex].title
    select(layers[selectedMenuIndex].markers[0]);
  }
  
  const hideLayer = () => {
    $mainWrap.classList.remove('is-hidden')
    $titleList.classList.remove('is-hidden')
    $storyWrap.classList.add('is-hidden')
    selectedMenuIndex = -1
  }

  const prev = () => {
    if (index === 0) {
      hideLayer()
      select(origin)
    }
    index = Math.max(0, index - 1);
    select(layers[selectedMenuIndex].markers[index]);
  };

  const next = () => {
    if (index + 1 === layers[selectedMenuIndex].markers.length) {
      hideLayer()
      index = 0
      select(origin)
    } else {
      index = Math.min(layers[selectedMenuIndex].markers.length - 1, index + 1);
      select(layers[selectedMenuIndex].markers[index]);
    }
  };

  const select = (targetMarker) => {
    reearth.visualizer.camera.flyTo(
      {
        lat: targetMarker.lat,
        lng: targetMarker.lng,
        height: targetMarker.height,
      },
      { duration: 2 }
    );
    reearth.layers.select(targetMarker.id);
    $storyNum.textContent = '(' + (index + 1) + ' / ' + layers[selectedMenuIndex].markers.length + ')'
    document.getElementById('marker_title').textContent = targetMarker.title;
  };

  document.getElementById('prev').addEventListener('click', prev);
  document.getElementById('next').addEventListener('click', next);
</script>
`;

reearth.ui.show(html);
reearth.on('update', update);
update();

function update() {
  // tourタグの付いたレイヤーから決め打ちで最初のものだけを取り出す
  const _origin = reearth.layers.findByTagLabels('origin')[0]
  let _layers = reearth.layers.findByTagLabels('story');
  let layers = []

  // このエラーチェックはもっとちゃんとやる必要あり
  if (typeof _layers === undefined) {
    return;
  }

  _layers.reverse().map((layer, index) => {
    if (!layer.children　|| !(layer.children.length > 0)) return null
    let markers = [];
    // 直下のChildrenが1つ、かつ、その下のChildrenが複数ある時（もっといい分類がありそう）はデータセット
    if (layer.children.length === 1 && layer.children[0].children.length > 0) {
      // 降順指定
      const desc = layer.tags && layer.tags.length > 0 && layer.tags.some(t => t.label === "descending")
      if (desc) {
        for (let i = 0; i <= layer.children[0].children.length - 1; i++) {
          markers.push({
            lat: layer.children[0].children[i].property?.default.location.lat,
            lng: layer.children[0].children[i].property?.default.location.lng,
            height: layer.children[0].children[i].property?.default.height || 10000,
            id: layer.children[0].children[i].id,
            title: layer.children[0].children[i].title
          });
        }
      } else {
        for (let i = layer.children[0].children.length - 1; i >= 0; i--) {
          markers.push({
            lat: layer.children[0].children[i].property?.default.location.lat,
            lng: layer.children[0].children[i].property?.default.location.lng,
            height: layer.children[0].children[i].property?.default.height || 10000,
            id: layer.children[0].children[i].id,
            title: layer.children[0].children[i].title
          });
        }
      }
    } else if (layer.children.length > 0) {
      // GUIでは下から上に連番となるため、ここでは逆順で登録する
      for (let i = layer.children.length - 1; i >= 0; i--) {
        markers.push({
          lat: layer.children[i].property?.default.location.lat,
          lng: layer.children[i].property?.default.location.lng,
          height: layer.children[i].property?.default.height || 10000,
          id: layer.children[i].id,
          title: layer.children[i].title
        });
      }
    }
    layers.push({
      title: layer.title,
      markers
    })
  })
  const origin = {
    lat: _origin.property.default.location.lat,
    lng: _origin.property.default.location.lng,
    height: _origin.property.default.height || 10000,
    id: _origin.id,
  }
  reearth.ui.postMessage({
    property: reearth.widget.property,
    layers,
    origin,
  });
}
