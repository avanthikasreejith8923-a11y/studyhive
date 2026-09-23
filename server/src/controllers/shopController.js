import { ITEM_CATALOG } from '../config/itemCatalog.js';
import { User } from '../models/User.js';

export const getCatalog = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      catalog: ITEM_CATALOG,
      user: {
        honey: user.honey,
        xp: user.xp,
        level: user.level,
        ownedItems: user.ownedItems || [],
        equippedItems: user.equippedItems || {},
      },
    });
  } catch (error) {
    console.error('getCatalog error:', error);
    return res.status(500).json({ message: 'Failed to fetch catalog.' });
  }
};

export const purchaseItem = async (req, res) => {
  try {
    const { itemId, autoEquip = true } = req.body;

    const item = ITEM_CATALOG.find((i) => i.id === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in catalog.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if already owned
    if (user.ownedItems && user.ownedItems.includes(itemId)) {
      // If already owned, just equip it if requested
      if (autoEquip && item.category) {
        user.equippedItems = user.equippedItems || {};
        user.equippedItems[item.category] = itemId;
        user.markModified('equippedItems');
        await user.save();
      }
      return res.status(200).json({
        message: 'You already own this item! Equipped successfully.',
        user,
        item,
      });
    }

    // Check honey balance
    if ((user.honey || 0) < item.cost) {
      return res.status(400).json({
        message: `Insufficient honey drops! You have ${user.honey || 0} 🍯, but this item costs ${item.cost} 🍯.`,
        needed: item.cost - (user.honey || 0),
      });
    }

    // Deduct honey and add item
    user.honey = (user.honey || 0) - item.cost;
    user.ownedItems = user.ownedItems || [];
    user.ownedItems.push(itemId);

    if (autoEquip && item.category) {
      user.equippedItems = user.equippedItems || {};
      user.equippedItems[item.category] = itemId;
      user.markModified('equippedItems');
    }

    user.markModified('ownedItems');
    await user.save();

    return res.status(200).json({
      message: `Unlocked ${item.name}! Added to your inventory. 🍯`,
      user,
      purchasedItem: item,
    });
  } catch (error) {
    console.error('purchaseItem error:', error);
    return res.status(500).json({ message: 'Failed to purchase item.', error: error.message });
  }
};

export const equipItem = async (req, res) => {
  try {
    const { itemId } = req.body;

    const item = ITEM_CATALOG.find((i) => i.id === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in catalog.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify ownership
    if (!user.ownedItems || !user.ownedItems.includes(itemId)) {
      return res.status(403).json({
        message: 'You do not own this item yet. Unlock it from the Honey Shop first!',
      });
    }

    user.equippedItems = user.equippedItems || {};
    user.equippedItems[item.category] = itemId;
    user.markModified('equippedItems');
    await user.save();

    return res.status(200).json({
      message: `Equipped ${item.name}!`,
      user,
      equippedItems: user.equippedItems,
    });
  } catch (error) {
    console.error('equipItem error:', error);
    return res.status(500).json({ message: 'Failed to equip item.', error: error.message });
  }
};
