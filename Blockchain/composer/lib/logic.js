/**
  * Trade schwag
  * @param  {org.acme.model.TradeSchwag} tradeSchwag - the trade schwag transaction
  * @transaction
  */
function tradeSchwag( tx ) {
  tx.item.owner = tx.owner;
  return getAssetRegistry( 'org.acme.model.Schwag' )
    .then( function( registry ) {
      return registry.update( tx.item );
    } );
  }
