module.exports =
{
    requireAll: function (context)
    {
        var map = {};
        context.keys().forEach(
            function (filename)
            {
                var required = context(filename);
                var key = required.id;

                if (!key)
                {
                    throw "Missing identifier. filename: " + filename;
                }

                if (map[key])
                {
                    throw key + " already required. filename: " + filename;
                }

                map[key] = required;
            });

        return map;
    }
};