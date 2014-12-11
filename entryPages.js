function crmHomepage(req, res) {
  res.render('crmHome');
}

function crmAboutpage(req, res) {
  res.render('crmAbout');
}

function ecommHomepage(req, res) {
  res.render('ecommHome');
}

function ecommAboutpage(req, res) {
  res.render('ecommAbout');
}

exports.crmHomepage = crmHomepage;
exports.crmAboutpage = crmAboutpage;
exports.ecommHomepage = ecommHomepage;
exports.ecommAboutpage = ecommAboutpage;
