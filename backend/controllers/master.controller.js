const masterService= require('../services/master.service');

const getMasterData = async (req, res) => {
    try {
        const { type } = req.params
        
        //validation 
        if (!type) {
            return res.status(400).json({
                message : 'Type is required '
            })
        }

        const data = await masterService.getMasterByType(type);

        return res.status(200).json({
            success: true,
            data : data
        })

    }

    catch (error) {
        console.error('Master data is required ', error)

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })

    }
};

module.exports = {getMasterData}; 