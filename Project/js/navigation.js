// 导航菜单交互逻辑
document.addEventListener('DOMContentLoaded', function() {
  // 子菜单切换
  const navItems = document.querySelectorAll('.sidebar-nav-item');
  
  navItems.forEach(item => {
    const link = item.querySelector('.sidebar-nav-link');
    const subNav = item.querySelector('.sidebar-subnav');
    
    if (subNav) {
      link.addEventListener('click', function(e) {
        // 只有当点击的是主链接而非子菜单链接时触发
        if (e.target === link || link.contains(e.target)) {
          e.preventDefault();
          
          // 切换当前项的活动状态
          item.classList.toggle('active');
          
          // 显示/隐藏子菜单
          if (window.innerWidth > 768) {
            subNav.style.display = subNav.style.display === 'none' ? 'block' : 'none';
          }
          
          // 关闭其他打开的子菜单
          navItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
              otherItem.classList.remove('active');
              const otherSubNav = otherItem.querySelector('.sidebar-subnav');
              if (otherSubNav) {
                otherSubNav.style.display = 'none';
              }
            }
          });
        }
      });
    }
  });
  
  // 检查当前页面，设置相应导航项为活动状态
  const currentPath = window.location.pathname;
  const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  
  navItems.forEach(item => {
    const links = item.querySelectorAll('a');
    links.forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        // 设置当前项和父项为活动状态
        link.parentElement.classList.add('active');
        if (link.classList.contains('sidebar-subnav-link')) {
          link.parentElement.parentElement.parentElement.classList.add('active');
          link.parentElement.parentElement.style.display = 'block';
        }
      }
    });
  });
}); 