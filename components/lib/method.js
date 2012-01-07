module.exports = Method = function ( params ) {
  this.name         = params.name;
  this.static       = params.static || false;
  this.privacy      = params.privacy;
  this.description  = params.description;
  this.properties   = params.properties;
  this.params       = params.params;
  this.returns      = params.returns;
  this.method_throws= params.method_throws;
  this.example      = params.example;
};