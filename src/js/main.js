function isAuthenticated() {
  var expiresAt = JSON.parse(localStorage.getItem('expires_at'))
  return new Date().getTime() < expiresAt
}

function setSession(authResult, user) {
  var expiresAt = JSON.stringify(
    authResult.expiresIn * 1000 + new Date().getTime()
  )
  localStorage.setItem('access_token', authResult.accessToken)
  localStorage.setItem('id_token', authResult.idToken)
  localStorage.setItem('expires_at', expiresAt)
  localStorage.setItem('attributes', JSON.stringify(user))
}

$(document).ready(function() {
  let base = window.location.protocol + '//' + window.location.host
  let href = window.location.href

  if (href == base + '/sso/') { /* index.html */
    if (!isAuthenticated()) {
      $('.alert').css('display', 'block')

      let timer = function() {
        setTimeout(function() {
          let display = $('.alert span:nth-child(2)')
          let time = display.text()
          time--
          display.text(time)
          if (time == 1) $('.alert span:last-child').css('display', 'none')

          if (time > 0) {
            timer()
          } else {
            $('.alert span:last-child').css('display', '')
            window.location.href = 'login.html'
          }
        }, 1000)
      }
      timer()
    } else {
      let user = JSON.parse(localStorage.getItem('attributes'))

      $('#fullName').val(user.name)
      $('#nickname').val(user.nickname)
      $('#email').val(user.email)
      $('#picture').attr('src', user.picture)

      if (user.email_verified) {
        $('#isEmailVerified').addClass('text-success')
        $('#isEmailVerified').text('Absolutely Yes')
      } else {
        $('#isEmailVerified').addClass('text-danger')
        $('#isEmailVerified').text('Definitely Not')
      }
      $('.card').css('display', 'block')
    }
  } else { /* login.html */
    if (isAuthenticated()) {
      window.location.href = '/sso/'
    } else {
      let webAuth = new auth0.WebAuth({
        domain: 'bahricanakkoyun.auth0.com',
        clientID: '5pZ-qKoUpiVTykWF5zK4tTTtNgGNMWow'
      })
  
      $('#facebookButton').click(function() {
        webAuth.authorize({
          responseType: 'token id_token',
          connection: 'facebook',
          redirectUri: base + '/sso/login.html'
        })
      })
  
      webAuth.parseHash(window.location.hash, function(err, authResult) {
        if (err) return console.log(err)
        if (authResult) {
          webAuth.client.userInfo(authResult.accessToken, function(err, user) {
            if (err) return console.log(err)
            setSession(authResult, user)
            window.location.href = '/sso/'
          })
        }
      })
    }
  }
})