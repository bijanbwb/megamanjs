Game.objects.Climbable = function()
{
    Engine.Object.call(this);
    this.applyTrait(new Game.traits.Climbable());
}

Engine.Util.extend(Game.objects.Climbable, Engine.Object);
