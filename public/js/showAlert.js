export const hideAlert=()=>{
    const el = document.querySelector('.alert');
    if(el) el.parentElement.removeChild(el);
}
export const showAlert=(type,message,time=5)=>{
    hideAlert();
    const markupt=`<div class="alert alert--${type}">${message}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin',markupt);
    window.setTimeout(hideAlert,time*1000);
}

