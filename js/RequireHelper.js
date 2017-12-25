module.exports =
{
    requireAll: function (context, getKey)
    {
        var map = {};
        context.keys().forEach(
            function (filename)
            {
                var required = context(filename);
                var key = getKey(required);

                if (map[key])
                {
                    throw key + " already required. filename: " + filename;
                }

                map[key] = required;
            });

        return map;
    }
};