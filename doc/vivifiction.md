# Vivification

Getting vivification right seems tricky - possibly because I'm approaching it wrong.

Here's how it seems it should work:

`$..id`
: Set the value of the first id property found. Don't ever create id.

`$..link.id`
: Set an id property on the first property called link.

`$.name`
: Set the name property on obj.

`$`
: Should set obj - can't with jsonpath api. Can assign to obj though.

`$.credits[*].email`
: Set email on the first element of the credits array (if it exists). Don't vivify credits.
