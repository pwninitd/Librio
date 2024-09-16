[...document.querySelectorAll('.btn')].forEach(function(item) {
    item.addEventListener('click', function() {
        if (item.classList.contains('active')){
            item.classList.remove('active');
        } else {
            item.classList.add('active');
        }
        allowContinue();
    });
});

function allowContinue(){
    btns = [...document.querySelectorAll('.btn')];
    foundActive = false;
    for(i=0;i<btns.length;i++){
        if(btns[i].classList.contains("active")){
            foundActive =true;
        }
    }

    next_btn = document.querySelector("#next-btn").classList;
    if(foundActive){
        if(next_btn.contains("d-none")){
            next_btn.remove("d-none");
        }
    }else{
        if(!next_btn.contains("d-none")){
            next_btn.add("d-none")
        }
    }
}

document.querySelector("#next-btn").addEventListener('click', (e) =>{
    btns = [...document.querySelectorAll('.btn')];
    pref = {'genres': []}
    for(i=0;i<btns.length;i++){
        if(btns[i].classList.contains("active")){
            if(btns[i].id == 'next-btn'){
                break;
            }
            pref.genres.push(btns[i].querySelector('h6 > strong').innerHTML);
        }
    }

    localStorage.setItem('pref', JSON.stringify(pref));
    window.location.replace('/choose-books/');
})