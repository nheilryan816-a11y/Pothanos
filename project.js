const STORAGE_KEYS = {
  accounts: 'accounts',
  user: 'loggedInUser',
  cart: 'krustyKrabCart'
};

const compactNavBreakpoint = 980;
const homeSectionSelectors = ['#Home', '#Menu', '#Offers', '#Testimonials', '#Location', '#Contact', '#About'];
let keysPressed = {};

const navMappings = [
  {
    linksContainer: document.getElementById('navLinks'),
    overflowWrapper: document.getElementById('navOverflow'),
    overflowMenu: document.getElementById('navOverflowMenu'),
    navContainer: document.getElementById('headerNavigator'),
    actions: document.getElementById('navActions'),
    brand: document.getElementById('brandGroup')
  },
  {
    linksContainer: document.querySelector('.menuPageLinks'),
    overflowWrapper: document.querySelector('.menuPageOverflow'),
    overflowMenu: document.querySelector('.menuPageOverflowMenu'),
    navContainer: document.querySelector('.menuPageNav'),
    actions: document.querySelector('.menuPageActions'),
    brand: document.querySelector('.menuPageBrand')
  }
];

/* ---- Storage helpers ---- */
function getAccounts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.accounts) || '[]');
}
function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
}
function getLoggedInUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null');
}
function setLoggedInUser(user) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}
function clearLoggedInUser() {
  localStorage.removeItem(STORAGE_KEYS.user);
}
function getCart() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
}
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  updateCartCount();
}
function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}
function getCartTotal() {
  return getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
}

/* ---- Toast ---- */
function showToast(message) {
  let toast = document.querySelector('.siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'siteToast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2400);
}

/* ---- Nav helpers ---- */
function getAllNavLinks() {
  return document.querySelectorAll('#navLinks a, #navOverflowMenu a, .menuPageLinks a, .menuPageOverflowMenu a');
}
function normalizeTarget(href) {
  if (!href) return '';
  if (href.includes('#')) return href.slice(href.indexOf('#'));
  return href;
}
function setActiveNavLink(activeTarget) {
  const isHomePage = window.location.pathname.toLowerCase().includes('home.html') || window.location.pathname.endsWith('/');
  const fallbackTarget = isHomePage ? '#Home' : '';
  const target = activeTarget || normalizeTarget(window.location.hash) || fallbackTarget;
  getAllNavLinks().forEach((link) => {
    const isActive = normalizeTarget(link.getAttribute('href')) === target;
    link.classList.toggle('nav-link-active', isActive);
  });
}

function syncSingleOverflowNav(config) {
  const { linksContainer, overflowWrapper, overflowMenu, navContainer, actions, brand } = config;
  if (!linksContainer || !overflowWrapper || !overflowMenu || !navContainer || !actions || !brand) return;
  if (overflowMenu.contains(actions)) navContainer.appendChild(actions);
  while (overflowMenu.firstChild) linksContainer.appendChild(overflowMenu.firstChild);
  overflowWrapper.classList.remove('is-visible');
  if (window.innerWidth > compactNavBreakpoint) return;
  const reservedWidth = actions.offsetWidth + 90;
  const availableWidth = navContainer.clientWidth - brand.offsetWidth - reservedWidth;
  while (linksContainer.scrollWidth > availableWidth && linksContainer.children.length > 1) {
    overflowWrapper.classList.add('is-visible');
    overflowMenu.prepend(linksContainer.lastElementChild);
  }
  if (window.innerWidth <= 768) {
    overflowMenu.appendChild(actions);
    overflowWrapper.classList.add('is-visible');
  }
  if (overflowMenu.children.length > 0) overflowWrapper.classList.add('is-visible');
}

function syncAllOverflowMenus() {
  navMappings.forEach(syncSingleOverflowNav);
  setActiveNavLink();
}

/* ============================================================
   RENDER HEADER ACTIONS — Profile icon dropdown (logged in)
   ============================================================ */
function renderHeaderActions() {
  const user = getLoggedInUser();
  const cartCount = getCartCount();
  const homeActions = document.getElementById('navActions');
  const menuActions = document.querySelector('.menuPageActions');

  if (homeActions) {
    homeActions.innerHTML = user
      ? `
        <span class="navProfileWrapper">
          <button type="button" class="navProfileBtn" title="My Profile" aria-label="Profile menu">
            ${user.name.charAt(0).toUpperCase()}
          </button>
          <div class="navProfileDropdown">
            <span class="profileDropdownName">${user.name}</span>
            <span class="profileDropdownEmail">${user.email}</span>
            <div class="profileDropdownDivider"></div>
            <button type="button" class="profileDropdownBtn" data-profile-view>&#128100; My Profile</button>
            <div class="profileDropdownDivider"></div>
            <button type="button" class="profileDropdownBtn logout-btn" data-logout-button>&#128682; Log Out</button>
          </div>
        </span>
        <button type="button" class="navCartBtn" data-open-cart>
          &#128722; Cart <span class="navCartBadge" data-cart-count>${cartCount}</span>
        </button>
      `
      : `
        <div id="LogInBTN"><a href="Login.html">Log In</a></div>
        <div id="signupBTNdiv"><a href="SignUp.html">Sign Up</a></div>
      `;
  }

  if (menuActions) {
    menuActions.innerHTML = user
      ? `
        <span class="menuPageProfileWrapper">
          <button type="button" class="menuPageProfileBtn" title="My Profile" aria-label="Profile menu">
            ${user.name.charAt(0).toUpperCase()}
          </button>
          <div class="menuPageProfileDropdown">
            <span class="profileDropdownName">${user.name}</span>
            <span class="profileDropdownEmail">${user.email}</span>
            <div class="profileDropdownDivider"></div>
            <button type="button" class="profileDropdownBtn" data-profile-view>&#128100; My Profile</button>
            <div class="profileDropdownDivider"></div>
            <button type="button" class="profileDropdownBtn logout-btn" data-logout-button>&#128682; Log Out</button>
          </div>
        </span>
        <button type="button" class="navCartBtn menuPageCartChip" data-open-cart>
          &#128722; Cart <span data-cart-count>${cartCount}</span>
        </button>
      `
      : `
        <div class="menuPageLogin"><a href="Login.html">Log In</a></div>
        <div class="menuPageSignup"><a href="SignUp.html">Sign Up</a></div>
      `;
  }
}

/* ---- Profile view modal ---- */
function openProfileModal() {
  const user = getLoggedInUser();
  if (!user) return;
  let modal = document.getElementById('profileModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'profileModal';
    modal.className = 'kkModal';
    modal.innerHTML = `
      <div class="kkModalBox" style="max-width:380px">
        <button class="kkModalClose" id="profileModalClose">&#10005;</button>
        <div style="font-size:3rem;text-align:center;margin-bottom:.5rem">&#128100;</div>
        <h3 class="kkModalTitle" id="profileModalName" style="text-align:center"></h3>
        <div class="paymentSummary" style="margin-top:.8rem">
          <div class="paymentSummaryRow"><span>Email</span><span id="profileModalEmail"></span></div>
          <div class="paymentSummaryRow"><span>Contact</span><span id="profileModalContact"></span></div>
        </div>
        <button type="button" class="kkModalBtn" style="background:rgba(148,34,34,0.09);color:#942222;margin-top:1rem" id="profileModalClose2">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'profileModalClose' || e.target.id === 'profileModalClose2') {
        modal.classList.remove('is-open');
      }
    });
  }
  modal.querySelector('#profileModalName').textContent = user.name;
  modal.querySelector('#profileModalEmail').textContent = user.email;
  modal.querySelector('#profileModalContact').textContent = user.contact || 'N/A';
  modal.classList.add('is-open');
}

/* ---- Footer injection (no cart section) ---- */
function injectFooter() {
  if (document.querySelector('.siteFooter')) return;
  const footer = document.createElement('footer');
  footer.className = 'siteFooter';
  footer.innerHTML = `
    <div class="siteFooterInner" style="grid-template-columns:1.4fr 1fr 1fr">
      <div class="siteFooterBrand">
        <h2>The Krusty Krab</h2>
        <p>Fresh favorites, memorable service, and classic Bikini Bottom flavor in every order.</p>
      </div>
      <div class="siteFooterLinks">
        <h3>Explore</h3>
        <a href="home.html#Home">Home</a>
        <a href="home.html#Offers">Offers</a>
        <a href="home.html#Testimonials">Testimonials</a>
        <a href="home.html#About">About</a>
      </div>
      <div class="siteFooterLinks">
        <h3>Visit</h3>
        <a href="home.html#Location">Locations</a>
        <a href="home.html#Contact">Contact</a>
        <a href="menu.html">Full Menu</a>
        <button type="button" class="footerTextButton" data-open-tac>Terms &amp; Conditions</button>
      </div>
    </div>
    <div class="siteFooterBottom">
      <p>&copy; <span data-current-year></span> The Krusty Krab. Crafted for hungry guests.</p>
    </div>
  `;
  document.body.appendChild(footer);
  const yearNode = footer.querySelector('[data-current-year]');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
}

/* ---- Cart count ---- */
function updateCartCount() {
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = String(cartCount);
  });
  document.querySelectorAll('[data-cart-total]').forEach((node) => {
    node.textContent = 'PHP ' + cartTotal.toFixed(2);
  });
}

/* ---- Add to cart ---- */
function addToCart(itemName, price, quantity) {
  if (!getLoggedInUser()) { openLoginGate(); return; }
  const cart = getCart();
  const existingItem = cart.find((item) => item.name === itemName && item.price === price);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ name: itemName, price, quantity });
  }
  saveCart(cart);
  renderCartSidebar();
  showToast(quantity + ' ' + itemName + (quantity > 1 ? 's' : '') + ' added to cart.');
  openCartSidebar();
}

/* ---- Login Gate ---- */
function openLoginGate() {
  const overlay = document.getElementById('loginGateOverlay');
  if (overlay) { overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden', 'false'); }
}
function closeLoginGate() {
  const overlay = document.getElementById('loginGateOverlay');
  if (overlay) { overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden', 'true'); }
}

/* ---- Cart Sidebar ---- */
function openCartSidebar() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartSidebarOverlay');
  if (sidebar) sidebar.classList.add('is-open');
  if (overlay) { overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden', 'false'); }
  renderCartSidebar();
}
function closeCartSidebar() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartSidebarOverlay');
  if (sidebar) sidebar.classList.remove('is-open');
  if (overlay) { overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden', 'true'); }
}
function renderCartSidebar() {
  const itemsContainer = document.getElementById('cartSidebarItems');
  const emptyMsg = document.getElementById('cartSidebarEmpty');
  const totalEl = document.getElementById('cartSidebarTotal');
  if (!itemsContainer) return;
  const cart = getCart();
  Array.from(itemsContainer.children).forEach((child) => { if (child.id !== 'cartSidebarEmpty') child.remove(); });
  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (totalEl) totalEl.textContent = 'PHP 0.00';
    return;
  }
  if (emptyMsg) emptyMsg.style.display = 'none';
  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cartSidebarItem';
    div.innerHTML = `
      <div class="cartSidebarItemInfo">
        <div class="cartSidebarItemName">${item.name}</div>
        <div class="cartSidebarItemMeta">PHP ${item.price.toFixed(2)} each</div>
      </div>
      <div class="cartSidebarItemQty">
        <button type="button" data-sidebar-qty-dec="${index}">-</button>
        <span>${item.quantity}</span>
        <button type="button" data-sidebar-qty-inc="${index}">+</button>
      </div>
      <button type="button" class="cartSidebarItemRemove" data-sidebar-remove="${index}">&#x2715;</button>
    `;
    itemsContainer.appendChild(div);
  });
  if (totalEl) totalEl.textContent = 'PHP ' + getCartTotal().toFixed(2);
}

/* ============================================================
   PAYMENT MODAL
   ============================================================ */
function injectPaymentModal() {
  if (document.getElementById('paymentModal')) return;
  const modal = document.createElement('div');
  modal.id = 'paymentModal';
  modal.className = 'kkModal';
  modal.innerHTML = `
    <div class="kkModalBox" style="max-width:460px;overflow-y:auto;max-height:90vh">
      <button class="kkModalClose" id="paymentModalClose">&#10005;</button>
      <div id="paymentView">
        <h3 class="kkModalTitle">Payment</h3>
        <div class="paymentSummary" id="paymentSummaryBlock">
          <div id="paymentItemsList"></div>
          <div class="paymentSummaryRow paymentSummaryTotal">
            <span>Total</span><span id="paymentGrandTotal"></span>
          </div>
        </div>
        <div class="paymentTabs">
          <button type="button" class="paymentTab active" data-pay-tab="card">&#128179; Card</button>
          <button type="button" class="paymentTab" data-pay-tab="ewallet">&#128241; E-Wallet</button>
          <button type="button" class="paymentTab" data-pay-tab="cod">&#127968; Cash on Delivery</button>
        </div>
        <div class="paymentPanel active" id="payPanel-card">
          <label class="paymentLabel">Cardholder Name</label>
          <input class="kkModalInput" id="payCardName" placeholder="Juan dela Cruz" autocomplete="cc-name">
          <label class="paymentLabel">Card Number</label>
          <input class="kkModalInput" id="payCardNum" placeholder="1234 5678 9012 3456" maxlength="19" autocomplete="cc-number">
          <div class="paymentRow">
            <div>
              <label class="paymentLabel">Expiry</label>
              <input class="kkModalInput" id="payCardExp" placeholder="MM/YY" maxlength="5" autocomplete="cc-exp">
            </div>
            <div>
              <label class="paymentLabel">CVV</label>
              <input class="kkModalInput" id="payCardCvv" placeholder="123" maxlength="3" type="password" autocomplete="cc-csc">
            </div>
          </div>
        </div>
        <div class="paymentPanel" id="payPanel-ewallet">
          <p class="kkModalBody" style="margin-bottom:.75rem">Select your e-wallet:</p>
          <div class="paymentEwallet">
            <div class="ewalletOption" data-ewallet="GCash"><span class="ewalletIcon">&#128153;</span>GCash</div>
            <div class="ewalletOption" data-ewallet="Maya"><span class="ewalletIcon">&#128154;</span>Maya</div>
            <div class="ewalletOption" data-ewallet="ShopeePay"><span class="ewalletIcon">&#129505;</span>ShopeePay</div>
            <div class="ewalletOption" data-ewallet="PayMaya"><span class="ewalletIcon">&#128156;</span>PayMaya</div>
          </div>
          <label class="paymentLabel">Mobile Number</label>
          <input class="kkModalInput" id="payEwalletNum" placeholder="09XX XXX XXXX" maxlength="13">
        </div>
        <div class="paymentPanel" id="payPanel-cod">
          <p class="kkModalBody">Your order will be delivered to your address. Please have the exact amount ready upon delivery.</p>
          <label class="paymentLabel">Delivery Address</label>
          <input class="kkModalInput" id="payCodAddress" placeholder="Street, Barangay, City">
          <label class="paymentLabel">Contact Number</label>
          <input class="kkModalInput" id="payCodContact" placeholder="09XX XXX XXXX">
        </div>
        <button type="button" class="kkModalBtn" id="payConfirmBtn">Confirm Payment</button>
      </div>
      <div id="paymentSuccess" style="display:none">
        <div class="paymentSuccess">
          <div class="paymentSuccessIcon">&#127881;</div>
          <div class="paymentSuccessTitle">Order Confirmed!</div>
          <p class="paymentSuccessMsg" id="paymentSuccessMsg"></p>
        </div>
        <button type="button" class="kkModalBtn" id="payDoneBtn" style="margin-top:1rem">Done</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  let activePayTab = 'card';
  let selectedEwallet = '';

  modal.querySelectorAll('[data-pay-tab]').forEach(function(tab) {
    tab.addEventListener('click', function() {
      activePayTab = tab.dataset.payTab;
      modal.querySelectorAll('.paymentTab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      modal.querySelectorAll('.paymentPanel').forEach(function(p) { p.classList.remove('active'); });
      modal.querySelector('#payPanel-' + activePayTab).classList.add('active');
    });
  });

  modal.querySelectorAll('.ewalletOption').forEach(function(opt) {
    opt.addEventListener('click', function() {
      modal.querySelectorAll('.ewalletOption').forEach(function(o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
      selectedEwallet = opt.dataset.ewallet;
    });
  });

  var cardNumInput = modal.querySelector('#payCardNum');
  cardNumInput.addEventListener('input', function() {
    var val = cardNumInput.value.replace(/\D/g, '').slice(0, 16);
    cardNumInput.value = val.replace(/(.{4})/g, '$1 ').trim();
  });

  var expInput = modal.querySelector('#payCardExp');
  expInput.addEventListener('input', function() {
    var val = expInput.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2);
    expInput.value = val;
  });

  modal.querySelector('#payConfirmBtn').addEventListener('click', function() {
    var cart = getCart();
    if (cart.length === 0) { showToast('Your cart is empty!'); return; }

    if (activePayTab === 'card') {
      var name = modal.querySelector('#payCardName').value.trim();
      var num = modal.querySelector('#payCardNum').value.replace(/\s/g,'');
      var exp = modal.querySelector('#payCardExp').value.trim();
      var cvv = modal.querySelector('#payCardCvv').value.trim();
      if (!name || num.length < 16 || exp.length < 5 || cvv.length < 3) {
        showToast('Please complete all card details.'); return;
      }
    } else if (activePayTab === 'ewallet') {
      if (!selectedEwallet) { showToast('Please select an e-wallet.'); return; }
      var num2 = modal.querySelector('#payEwalletNum').value.trim();
      if (!num2) { showToast('Please enter your mobile number.'); return; }
    } else if (activePayTab === 'cod') {
      var addr = modal.querySelector('#payCodAddress').value.trim();
      var contact = modal.querySelector('#payCodContact').value.trim();
      if (!addr || !contact) { showToast('Please fill in delivery details.'); return; }
    }

    var user = getLoggedInUser();
    var total = getCartTotal().toFixed(2);
    var method = activePayTab === 'card' ? 'Card' : activePayTab === 'ewallet' ? selectedEwallet : 'Cash on Delivery';
    saveCart([]);
    updateCartCount();
    closeCartSidebar();

    modal.querySelector('#paymentView').style.display = 'none';
    modal.querySelector('#paymentSuccess').style.display = 'block';
    modal.querySelector('#paymentSuccessMsg').textContent =
      'Thank you' + (user ? ', ' + user.name.split(' ')[0] : '') + '! Your order worth PHP ' + total + ' has been placed via ' + method + '. Estimated delivery: 30-45 minutes.';
  });

  modal.querySelector('#payDoneBtn').addEventListener('click', function() {
    modal.classList.remove('is-open');
    setTimeout(function() {
      modal.querySelector('#paymentView').style.display = 'block';
      modal.querySelector('#paymentSuccess').style.display = 'none';
      modal.querySelector('#payCardName').value = '';
      modal.querySelector('#payCardNum').value = '';
      modal.querySelector('#payCardExp').value = '';
      modal.querySelector('#payCardCvv').value = '';
    }, 400);
  });

  modal.querySelector('#paymentModalClose').addEventListener('click', function() {
    modal.classList.remove('is-open');
  });
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.classList.remove('is-open'); });
}

function openPaymentModal() {
  var user = getLoggedInUser();
  if (!user) { openLoginGate(); return; }
  var cart = getCart();
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  var modal = document.getElementById('paymentModal');
  if (!modal) return;

  var itemsList = modal.querySelector('#paymentItemsList');
  itemsList.innerHTML = cart.map(function(item) {
    return '<div class="paymentSummaryRow"><span>' + item.name + ' x' + item.quantity + '</span><span>PHP ' + (item.price * item.quantity).toFixed(2) + '</span></div>';
  }).join('');
  modal.querySelector('#paymentGrandTotal').textContent = 'PHP ' + getCartTotal().toFixed(2);
  modal.classList.add('is-open');
}

/* ============================================================
   TERMS & CONDITIONS MODAL
   ============================================================ */
function injectTacModal() {
  if (document.getElementById('tacModal')) return;
  var modal = document.createElement('div');
  modal.id = 'tacModal';
  modal.className = 'kkModal';
  modal.innerHTML = `
    <div class="kkModalBox" style="max-width:500px;max-height:80vh;overflow-y:auto">
      <button class="kkModalClose" id="tacModalClose">&#10005;</button>
      <h3 class="kkModalTitle">Terms &amp; Conditions</h3>
      <div class="kkModalBody" style="font-size:.87rem">
        <p><strong>1. Account &amp; Data</strong><br>
        Your account information is stored only in your browser's local storage for this demo. No data is transmitted to a server.</p><br>
        <p><strong>2. Orders &amp; Payments</strong><br>
        All orders and payments in this demo are simulated. No real charges are made. Promo prices, item availability, and delivery times are for demonstration purposes only.</p><br>
        <p><strong>3. Privacy</strong><br>
        We do not collect or share your personal information outside of this browser session.</p><br>
        <p><strong>4. Availability</strong><br>
        Menu items, promotions, and branch availability may change without notice. The Krusty Krab reserves the right to modify offerings at any time.</p><br>
        <p><strong>5. Accuracy</strong><br>
        While we strive for accuracy in pricing and descriptions, errors may occur. We reserve the right to correct any errors.</p><br>
        <p><strong>6. Use of Service</strong><br>
        This platform is for personal, non-commercial use. Any misuse, abuse, or fraudulent activity may result in account suspension.</p><br>
        <p style="color:#942222;font-weight:700">By creating an account, you agree to these Terms &amp; Conditions.</p>
      </div>
      <button type="button" class="kkModalBtn" id="tacModalAccept">I Agree</button>
    </div>
  `;
  document.body.appendChild(modal);
  var closeModal = function() { modal.classList.remove('is-open'); };
  modal.querySelector('#tacModalClose').addEventListener('click', closeModal);
  modal.querySelector('#tacModalAccept').addEventListener('click', function() {
    closeModal();
    var cb = document.getElementById('tacCheckbox');
    if (cb) cb.checked = true;
  });
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
}

function openTacModal() {
  var modal = document.getElementById('tacModal');
  if (modal) modal.classList.add('is-open');
}

/* ============================================================
   FORGOT PASSWORD MODAL
   ============================================================ */
function injectForgotPwModal() {
  if (document.getElementById('forgotPwModal')) return;
  var modal = document.createElement('div');
  modal.id = 'forgotPwModal';
  modal.className = 'kkModal';
  modal.innerHTML = `
    <div class="kkModalBox">
      <button class="kkModalClose" id="forgotPwClose">&#10005;</button>
      <div id="forgotPwStep1">
        <h3 class="kkModalTitle">Reset Password</h3>
        <p class="kkModalBody">Enter the email address linked to your account and we'll send you a reset link.</p>
        <input type="email" class="kkModalInput" id="forgotPwEmail" placeholder="your@email.com" autocomplete="email">
        <button type="button" class="kkModalBtn" id="forgotPwSendBtn">Send Reset Link</button>
      </div>
      <div id="forgotPwStep2" style="display:none;text-align:center">
        <div style="font-size:3rem;margin-bottom:.5rem">&#128231;</div>
        <h3 class="kkModalTitle">Check Your Email</h3>
        <p class="kkModalBody" id="forgotPwConfirmMsg"></p>
        <button type="button" class="kkModalBtn" id="forgotPwDoneBtn">Done</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  var closeModal = function() { modal.classList.remove('is-open'); };
  modal.querySelector('#forgotPwClose').addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });

  modal.querySelector('#forgotPwSendBtn').addEventListener('click', function() {
    var email = modal.querySelector('#forgotPwEmail').value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      showToast('Please enter a valid email address.'); return;
    }
    modal.querySelector('#forgotPwStep1').style.display = 'none';
    modal.querySelector('#forgotPwStep2').style.display = 'block';
    modal.querySelector('#forgotPwConfirmMsg').textContent =
      'If ' + email + ' is registered with us, a password reset link has been sent. Please check your inbox and spam folder.';
  });

  modal.querySelector('#forgotPwDoneBtn').addEventListener('click', function() {
    closeModal();
    setTimeout(function() {
      modal.querySelector('#forgotPwStep1').style.display = 'block';
      modal.querySelector('#forgotPwStep2').style.display = 'none';
      modal.querySelector('#forgotPwEmail').value = '';
    }, 350);
  });
}

function openForgotPwModal() {
  var modal = document.getElementById('forgotPwModal');
  if (modal) modal.classList.add('is-open');
}

/* ============================================================
   OTP MODAL
   ============================================================ */
var pendingSignupData = null;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function injectOtpModal() {
  if (document.getElementById('otpModal')) return;
  var modal = document.createElement('div');
  modal.id = 'otpModal';
  modal.className = 'kkModal';
  modal.style.zIndex = '300';
  modal.innerHTML = `
    <div class="kkModalBox" style="text-align:center">
      <h3 class="kkModalTitle">Email Verification</h3>
      <p class="kkModalBody" id="otpInstructions"></p>
      <div class="otpDigits">
        <input class="otpDigit" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]">
        <input class="otpDigit" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]">
        <input class="otpDigit" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]">
        <input class="otpDigit" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]">
        <input class="otpDigit" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]">
        <input class="otpDigit" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]">
      </div>
      <p style="font-size:.8rem;color:#9a7070;margin-bottom:.75rem">Didn't get the code? <button type="button" id="otpResendBtn" style="background:none;border:none;color:#942222;font-weight:700;cursor:pointer;font-size:.8rem;padding:0">Resend</button></p>
      <button type="button" class="kkModalBtn" id="otpVerifyBtn">Verify &amp; Create Account</button>
    </div>
  `;
  document.body.appendChild(modal);

  var digits = modal.querySelectorAll('.otpDigit');
  digits.forEach(function(input, i) {
    input.addEventListener('input', function() {
      input.value = input.value.replace(/\D/g,'').slice(-1);
      if (input.value && i < digits.length - 1) digits[i+1].focus();
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !input.value && i > 0) digits[i-1].focus();
    });
  });

  modal.querySelector('#otpResendBtn').addEventListener('click', function() {
    if (!pendingSignupData) return;
    pendingSignupData.otp = generateOtp();
    prompt('OTP sent to ' + pendingSignupData.email + '\n\nYour new verification code is:\n\n' + pendingSignupData.otp + '\n\n(Demo mode - in production this is emailed to you.)');
    digits.forEach(function(d) { d.value = ''; });
    digits[0].focus();
  });

  modal.querySelector('#otpVerifyBtn').addEventListener('click', function() {
    var entered = Array.from(digits).map(function(d) { return d.value; }).join('');
    if (entered.length < 6) { showToast('Please enter the full 6-digit code.'); return; }
    if (!pendingSignupData) return;
    if (entered !== pendingSignupData.otp) {
      showToast('Incorrect OTP. Please try again.');
      digits.forEach(function(d) { d.value = ''; });
      digits[0].focus();
      return;
    }
    var accounts = getAccounts();
    accounts.push({ name: pendingSignupData.name, email: pendingSignupData.email, contact: pendingSignupData.contact, password: pendingSignupData.password });
    saveAccounts(accounts);
    modal.classList.remove('is-open');
    pendingSignupData = null;
    showToast('Account created! Please log in.');
    setTimeout(function() { window.location.href = 'Login.html'; }, 800);
  });
}

function openOtpModal(email) {
  var modal = document.getElementById('otpModal');
  if (!modal) return;
  modal.querySelector('#otpInstructions').textContent =
    'A 6-digit verification code was sent to ' + email + '. Enter it below to complete your registration.';
  modal.querySelectorAll('.otpDigit').forEach(function(d) { d.value = ''; });
  modal.classList.add('is-open');
  setTimeout(function() { modal.querySelector('.otpDigit').focus(); }, 200);
}

/* ============================================================
   PASSWORD STRENGTH RULES (inline, visible while typing)
   ============================================================ */
function injectPasswordRules(passwordInputId, rulesContainerId) {
  var input = document.getElementById(passwordInputId);
  var container = document.getElementById(rulesContainerId);
  if (!input || !container) return;

  var rules = [
    { id: 'r-len',   test: function(v) { return v.length >= 8; },          label: 'At least 8 characters' },
    { id: 'r-upper', test: function(v) { return /[A-Z]/.test(v); },        label: 'At least 1 uppercase letter' },
    { id: 'r-sym',   test: function(v) { return /[!@#$%^&*]/.test(v); },   label: 'At least 1 symbol (!@#$%^&*)' },
  ];

  container.innerHTML = '<ul class="pwRules">' + rules.map(function(r) {
    return '<li class="pwRule" id="' + r.id + '">' + r.label + '</li>';
  }).join('') + '</ul>';

  input.addEventListener('input', function() {
    var val = input.value;
    rules.forEach(function(r) {
      var el = container.querySelector('#' + r.id);
      if (el) el.classList.toggle('met', r.test(val));
    });
  });
}

/* ============================================================
   AUTH FORMS
   ============================================================ */
function setupAuthForms() {
  var loginPage = document.getElementById('loginTXT');
  var signUpPage = document.getElementById('SignUPTXT');

  if (loginPage) {
    var form = document.querySelector('form');
    var emailInput = document.getElementById('Email');
    var passwordInput = document.getElementById('Password');

    var forgotLabel = document.getElementById('forgotTXT');
    if (forgotLabel) {
      var forgotLink = forgotLabel.closest('a') || forgotLabel.parentElement;
      forgotLink.style.cursor = 'pointer';
      forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        openForgotPwModal();
      });
    }

    if (form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        var email = (emailInput ? emailInput.value.trim() : '');
        var password = (passwordInput ? passwordInput.value : '');
        if (!email || !password) { showToast('Please enter both email and password.'); return; }
        var account = getAccounts().find(function(entry) { return entry.email === email && entry.password === password; });
        if (!account) { showToast('Invalid email or password.'); return; }
        setLoggedInUser(account);
        showToast('Welcome back, ' + account.name.split(' ')[0] + '!');
        window.location.href = 'home.html';
      });
    }
  }

  if (signUpPage) {
    var form2 = document.querySelector('form');
    var nameInput = document.getElementById('Nama');
    var emailInput2 = document.getElementById('Email');
    var contactInput = document.getElementById('Number');
    var passwordInput2 = document.getElementById('Password');
    var confirmPasswordInput = document.getElementById('ConfirmPassword');
    var termsCheckbox = document.getElementById('tacCheckbox');

    var tacLabel = document.getElementById('tacTXT');
    if (tacLabel) {
      var tacLink = tacLabel.closest('a') || tacLabel.parentElement;
      tacLink.style.cursor = 'pointer';
      tacLink.addEventListener('click', function(e) {
        e.preventDefault();
        openTacModal();
      });
    }

    // Inject password rules below password input
    var pwLi = passwordInput2 ? passwordInput2.closest('li') : null;
    if (pwLi) {
      var rulesDiv = document.createElement('div');
      rulesDiv.id = 'pwRulesContainer';
      pwLi.appendChild(rulesDiv);
      injectPasswordRules('Password', 'pwRulesContainer');
    }

    if (form2) {
      form2.addEventListener('submit', function(event) {
        event.preventDefault();
        var name = (nameInput ? nameInput.value.trim() : '');
        var email = (emailInput2 ? emailInput2.value.trim() : '');
        var contact = (contactInput ? contactInput.value.trim() : '');
        var password = (passwordInput2 ? passwordInput2.value : '');
        var confirmPassword = (confirmPasswordInput ? confirmPasswordInput.value : '');

        if (!name || !email || !contact || !password || !confirmPassword) {
          showToast('Please complete all sign up fields.'); return;
        }
        if (!termsCheckbox || !termsCheckbox.checked) {
          showToast('You must agree to the Terms and Conditions.'); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          showToast('Enter a valid email address.'); return;
        }
        if (!/^[0-9]{10,15}$/.test(contact)) {
          showToast('Enter a valid contact number (10-15 digits).'); return;
        }
        if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) {
          showToast('Password does not meet all requirements.'); return;
        }
        if (password !== confirmPassword) {
          showToast('Passwords do not match.'); return;
        }
        var accounts = getAccounts();
        if (accounts.some(function(entry) { return entry.email === email; })) {
          showToast('An account with this email already exists.'); return;
        }

        var otp = generateOtp();
        pendingSignupData = { name: name, email: email, contact: contact, password: password, otp: otp };
        prompt('OTP sent to ' + email + '\n\nYour verification code is:\n\n' + otp + '\n\n(Demo mode - in production this would be emailed to you.)');
        openOtpModal(email);
      });
    }
  }
}

/* ---- Home add buttons ---- */
function setupHomeAddButtons() {
  document.querySelectorAll('.menuCard').forEach(function(card) {
    var button = card.querySelector('.menuAddButton');
    var title = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : null;
    var priceText = card.querySelector('.menuPrice') ? card.querySelector('.menuPrice').textContent : '0';
    if (!button || !title) return;
    button.addEventListener('click', function() {
      var price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
      addToCart(title, price, 1);
    });
  });
}

function setupMenuCategories() {
  var categoryChips = document.querySelectorAll('.menuCategoryChip');
  var menuCards = document.querySelectorAll('.menuProductCard');
  if (categoryChips.length === 0 || menuCards.length === 0) return;
  var applyMenuFilter = function(selectedCategory) {
    categoryChips.forEach(function(chip) { chip.classList.toggle('active', chip.dataset.category === selectedCategory); });
    menuCards.forEach(function(card) {
      var matches = selectedCategory === 'all' || card.dataset.category === selectedCategory;
      card.classList.toggle('is-hidden', !matches);
    });
  };
  var activeChip = document.querySelector('.menuCategoryChip.active');
  applyMenuFilter(activeChip ? activeChip.dataset.category : categoryChips[0].dataset.category);
  categoryChips.forEach(function(chip) { chip.addEventListener('click', function() { applyMenuFilter(chip.dataset.category); }); });
}

function normalizeMenuQuantities() {
  document.querySelectorAll('.menuQtyControls').forEach(function(control) {
    var buttons = control.querySelectorAll('button');
    if (buttons.length >= 2) { buttons[0].textContent = '-'; buttons[1].textContent = '+'; }
  });
  document.querySelectorAll('.menuProductCard, .promoCard').forEach(function(card) {
    var qtyValue = card.querySelector('.menuQtyControls span');
    var priceElement = card.querySelector('.menuProductPrice');
    if (!qtyValue || !priceElement) return;
    var unitPrice = parseFloat(priceElement.dataset.unitPrice || card.dataset.unitPrice || '0');
    var quantity = parseInt(qtyValue.textContent || '1', 10) || 1;
    priceElement.textContent = 'PHP ' + (unitPrice * quantity).toFixed(2);
  });
}

function setupMenuAddToCart() {
  document.querySelectorAll('.menuProductCard').forEach(function(card) {
    var button = card.querySelector('.menuCartButton');
    var titleEl = card.querySelector('.menuProductInfo h2');
    var title = titleEl ? titleEl.textContent.trim() : null;
    var priceElement = card.querySelector('.menuProductPrice');
    var qtyNode = card.querySelector('.menuQtyControls span');
    if (!button || !title || !priceElement || !qtyNode) return;
    button.addEventListener('click', function() {
      var unitPrice = parseFloat(priceElement.dataset.unitPrice || '0');
      var quantity = parseInt(qtyNode.textContent || '1', 10) || 1;
      addToCart(title, unitPrice, quantity);
    });
  });
}

function setupPromoAddToCart() {
  document.querySelectorAll('.promoCard').forEach(function(card) {
    var button = card.querySelector('.promoCartButton');
    var h3 = card.querySelector('h3');
    var title = card.dataset.offerName || (h3 ? h3.textContent.trim() : null);
    var qtyNode = card.querySelector('.menuQtyControls span');
    var priceElement = card.querySelector('.menuProductPrice');
    if (!button || !title || !qtyNode || !priceElement) return;
    button.addEventListener('click', function() {
      var unitPrice = parseFloat(priceElement.dataset.unitPrice || card.dataset.unitPrice || '0');
      var quantity = parseInt(qtyNode.textContent || '1', 10) || 1;
      addToCart(title, unitPrice, quantity);
    });
  });
}

function setupHomeScrollSpy() {
  var sections = homeSectionSelectors.map(function(selector) { return document.querySelector(selector); }).filter(Boolean);
  if (sections.length === 0 || !('IntersectionObserver' in window)) return;
  var observer = new IntersectionObserver(function(entries) {
    var visibleEntries = entries.filter(function(e) { return e.isIntersecting; }).sort(function(a, b) { return b.intersectionRatio - a.intersectionRatio; });
    if (visibleEntries.length > 0) setActiveNavLink('#' + visibleEntries[0].target.id);
  }, { rootMargin: '-35% 0px -45% 0px', threshold: [0.2, 0.4, 0.6] });
  sections.forEach(function(section) { observer.observe(section); });
}

/* ---- Checkout ---- */
function handleCheckout() {
  var cart = getCart();
  if (cart.length === 0) { showToast('Your cart is still empty.'); return; }
  if (!getLoggedInUser()) { openLoginGate(); return; }
  closeCartSidebar();
  openPaymentModal();
}

/* ============================================================
   GLOBAL CLICK INTERACTIONS
   ============================================================ */
function attachGlobalInteractions() {
  document.addEventListener('click', function(event) {
    var navLink = event.target.closest('#navLinks a, #navOverflowMenu a, .menuPageLinks a, .menuPageOverflowMenu a');
    if (navLink) setActiveNavLink(normalizeTarget(navLink.getAttribute('href')));

    var qtyButton = event.target.closest('.menuQtyControls button');
    if (qtyButton) {
      var qtyControls = qtyButton.closest('.menuQtyControls');
      var qtyValue = qtyControls ? qtyControls.querySelector('span') : null;
      var menuCard = qtyButton.closest('.menuProductCard, .promoCard');
      var priceElement = menuCard ? menuCard.querySelector('.menuProductPrice') : null;
      if (qtyControls && qtyValue && priceElement) {
        var buttons = qtyControls.querySelectorAll('button');
        var isDecrease = qtyButton === buttons[0];
        var currentValue = parseInt(qtyValue.textContent || '1', 10) || 1;
        var nextValue = isDecrease ? Math.max(1, currentValue - 1) : currentValue + 1;
        var unitPrice = parseFloat(priceElement.dataset.unitPrice || '0');
        qtyValue.textContent = String(nextValue);
        priceElement.textContent = 'PHP ' + (unitPrice * nextValue).toFixed(2);
      }
    }

    var logoutButton = event.target.closest('[data-logout-button]');
    if (logoutButton) {
      clearLoggedInUser();
      renderHeaderActions();
      syncAllOverflowMenus();
      updateCartCount();
      showToast('You have been logged out.');
    }

    var profileView = event.target.closest('[data-profile-view]');
    if (profileView) openProfileModal();

    var openCartBtn = event.target.closest('[data-open-cart]');
    if (openCartBtn) openCartSidebar();

    if (event.target.id === 'cartSidebarClose' || event.target.id === 'cartSidebarOverlay') closeCartSidebar();
    if (event.target.id === 'loginGateDismiss' || event.target.id === 'loginGateOverlay') closeLoginGate();

    var sidebarDec = event.target.closest('[data-sidebar-qty-dec]');
    if (sidebarDec) {
      var idx = parseInt(sidebarDec.dataset.sidebarQtyDec, 10);
      var cart = getCart();
      if (cart[idx]) { cart[idx].quantity = Math.max(1, cart[idx].quantity - 1); saveCart(cart); renderCartSidebar(); }
    }

    var sidebarInc = event.target.closest('[data-sidebar-qty-inc]');
    if (sidebarInc) {
      var idx2 = parseInt(sidebarInc.dataset.sidebarQtyInc, 10);
      var cart2 = getCart();
      if (cart2[idx2]) { cart2[idx2].quantity += 1; saveCart(cart2); renderCartSidebar(); }
    }

    var sidebarRemove = event.target.closest('[data-sidebar-remove]');
    if (sidebarRemove) {
      var idx3 = parseInt(sidebarRemove.dataset.sidebarRemove, 10);
      var cart3 = getCart();
      cart3.splice(idx3, 1);
      saveCart(cart3);
      renderCartSidebar();
    }

    var checkoutButton = event.target.closest('[data-checkout-button]');
    if (checkoutButton) handleCheckout();

    var openTacBtn = event.target.closest('[data-open-tac]');
    if (openTacBtn) openTacModal();
  });

  document.addEventListener('keydown', function(event) {
    keysPressed[event.key] = true;
    if (keysPressed.CapsLock && keysPressed.d && keysPressed.s && keysPressed.a) {
      window.location.href = 'Login.html';
    }
  });

  document.addEventListener('keyup', function(event) {
    keysPressed[event.key] = false;
  });
}

window.addEventListener('hashchange', function() { setActiveNavLink(); });
window.addEventListener('resize', syncAllOverflowMenus);

window.addEventListener('load', function() {
  renderHeaderActions();
  injectFooter();
  injectTacModal();
  injectForgotPwModal();
  injectOtpModal();
  injectPaymentModal();
  syncAllOverflowMenus();
  setActiveNavLink();
  setupMenuCategories();
  normalizeMenuQuantities();
  setupMenuAddToCart();
  setupPromoAddToCart();
  setupHomeAddButtons();
  setupHomeScrollSpy();
  setupAuthForms();
  updateCartCount();
});

attachGlobalInteractions();