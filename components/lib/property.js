module.exports = Property = function (params) {
  this.name        = params.name;
  this.static      = params.static || false;
  this.privacy     = params.privacy;
  this.description = params.description;
  this.properties  = params.properties || [];
  this.type        = params.type;
  this.example     = params.example;
};