Game.objects.characters.Megaman = function()
{
    Game.objects.Character.call(this);

    this.decorations = {
        'sweat': new Game.objects.decorations.Sweat(),
    };

    this.bind(Game.traits.Weapon.prototype.EVENT_EQUIP, this.changeDress);
    this.bind(Game.traits.Health.prototype.EVENT_HURT, this.damage)
}

Engine.Util.extend(Game.objects.characters.Megaman,
                   Game.objects.Character);

Game.objects.characters.Megaman.prototype.changeDress = function(weapon)
{
    var textureId = "megaman-" + weapon.code;
    if (this.textures[textureId]) {
        this.model.material.map = this.textures[textureId];
        this.model.material.needsUpdate = true;
    }
}

Game.objects.characters.Megaman.prototype.damage = function(points, direction)
{
    if (this.health.amount > 0) {
        var sweat = this.decorations['sweat']
        sweat.position.copy(this.position);
        sweat.position.y += 12;
        sweat.sprites.sprite.time = 0;
        sweat.lifetime = 0;
        this.world.addObject(sweat);
    }
    return true;
}

Game.objects.characters.Megaman.prototype.routeAnimation = function()
{
    var anim = this.animators[0];
    if (this.teleport.state) {
        if (this.teleport.state == this.teleport.STATE_OUT) {
            return anim.pickAnimation('teleport-out');
        }
        else if (this.teleport.state == this.teleport.STATE_IN) {
            return anim.pickAnimation('teleport-in');
        }
        return anim.pickAnimation('teleport');
    }

    if (this.stun._engaged === true) {
        return anim.pickAnimation('stunned');
    }

    if (this.climber.attached !== undefined) {
        if (this.weapon._firing) {
            return anim.pickAnimation('hang-shoot');
        }
        if (this.velocity.y !== 0) {
            return anim.pickAnimation('climbing');
        }
        return anim.pickAnimation('hang');
    }

    if (!this.isSupported) {
        if (this.weapon._firing) {
            return anim.pickAnimation('jump-fire');
        }
        return anim.pickAnimation('jump');
    }

    if (this.move._interimSpeed) {
        if (this.move._interimSpeed < this.move.speed * .8) {
            if (this.weapon._firing) {
                return anim.pickAnimation('fire');
            }
            return anim.pickAnimation('lean');
        }
        if (this.weapon._firing) {
            return anim.pickAnimation('run-fire');
        }
        return anim.pickAnimation('run');
    }

    if (this.weapon._firing) {
        return anim.pickAnimation('fire');
    }

    return anim.pickAnimation('idle');
}
